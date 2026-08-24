import { Prisma, PrismaClient } from '@prisma/client';
import { db } from '@/lib/db';
import {
  APPROVED_BUCKET_STATUSES,
  Distance,
  ParticipantType,
  RegistrationStatus,
  RESERVED_BUCKET_STATUSES,
} from '@/lib/config';

export class QuotaFullError extends Error {
  constructor(distance: Distance, participantType: ParticipantType) {
    super(`Quota full for ${distance} ${participantType}`);
    this.name = 'QuotaFullError';
  }
}

type Db = PrismaClient | Prisma.TransactionClient;

type Bucket = 'reservedCount' | 'approvedCount' | 'none';

function bucketOf(status: RegistrationStatus): Bucket {
  if ((RESERVED_BUCKET_STATUSES as string[]).includes(status)) return 'reservedCount';
  if ((APPROVED_BUCKET_STATUSES as string[]).includes(status)) return 'approvedCount';
  return 'none';
}

// Atomic, capacity-guarded increment. A single UPDATE ... WHERE statement is
// safe under concurrent writers on Postgres (row lock during the update) —
// this is the one place overbooking could otherwise happen, so it must
// never be a read-then-write pair of queries.
async function incrementBucket(
  tx: Db,
  distance: Distance,
  participantType: ParticipantType,
  bucket: 'reservedCount' | 'approvedCount'
) {
  const column = Prisma.raw(`"${bucket}"`);
  const affected = await tx.$executeRaw`
    UPDATE "Quota"
    SET ${column} = ${column} + 1
    WHERE "distance" = ${distance}
      AND "participantType" = ${participantType}
      AND ("reservedCount" + "approvedCount") < "capacity"
  `;
  if (affected === 0) throw new QuotaFullError(distance, participantType);
}

async function decrementBucket(
  tx: Db,
  distance: Distance,
  participantType: ParticipantType,
  bucket: 'reservedCount' | 'approvedCount'
) {
  const column = Prisma.raw(`"${bucket}"`);
  await tx.$executeRaw`
    UPDATE "Quota"
    SET ${column} = ${column} - 1
    WHERE "distance" = ${distance}
      AND "participantType" = ${participantType}
      AND ${column} > 0
  `;
}

/** Called once, at registration submit time. Throws QuotaFullError if full. */
export async function reserveQuotaSlot(
  distance: Distance,
  participantType: ParticipantType,
  tx: Db = db
) {
  await incrementBucket(tx, distance, participantType, 'reservedCount');
}

/**
 * Called whenever an admin (or the system) changes a registration's status,
 * to keep Quota.reservedCount / approvedCount in sync with reality. Safe to
 * call with oldStatus === newStatus (no-op) or between any two statuses.
 */
export async function adjustQuotaForStatusChange(
  distance: Distance,
  participantType: ParticipantType,
  oldStatus: RegistrationStatus,
  newStatus: RegistrationStatus,
  tx: Db = db
) {
  const oldBucket = bucketOf(oldStatus);
  const newBucket = bucketOf(newStatus);
  if (oldBucket === newBucket) return;

  if (oldBucket !== 'none') await decrementBucket(tx, distance, participantType, oldBucket);
  if (newBucket !== 'none') await incrementBucket(tx, distance, participantType, newBucket);
}

export async function getQuotaOverview() {
  const quotas = await db.quota.findMany();
  return quotas.map((q) => {
    const occupied = q.reservedCount + q.approvedCount;
    const remaining = Math.max(0, q.capacity - occupied);
    const remainingRatio = q.capacity > 0 ? remaining / q.capacity : 0;
    let status: 'AVAILABLE' | 'ALMOST_FULL' | 'FULL' = 'AVAILABLE';
    if (remaining <= 0) status = 'FULL';
    else if (remainingRatio < 0.2) status = 'ALMOST_FULL';
    return {
      distance: q.distance as Distance,
      participantType: q.participantType as ParticipantType,
      capacity: q.capacity,
      reservedCount: q.reservedCount,
      approvedCount: q.approvedCount,
      occupied,
      remaining,
      status,
    };
  });
}
