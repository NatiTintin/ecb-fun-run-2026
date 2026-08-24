import { Prisma, PrismaClient } from '@prisma/client';
import { db } from '@/lib/db';
import { Distance, ParticipantType, distanceCode, participantTypeCode } from '@/lib/config';

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Mints a unique, sequential, human-readable registration ID such as
 * ECB26-5A-0001 (5KM Adult) or ECB26-3C-0002 (3KM Child). Uses an
 * atomic UPDATE ... RETURNING against Quota.nextSequence so concurrent
 * submissions never collide, without needing a separate counter table.
 */
export async function nextRegistrationId(
  distance: Distance,
  participantType: ParticipantType,
  tx: Db = db
): Promise<string> {
  const rows = await tx.$queryRaw<{ nextSequence: number }[]>`
    UPDATE "Quota"
    SET "nextSequence" = "nextSequence" + 1
    WHERE "distance" = ${distance} AND "participantType" = ${participantType}
    RETURNING "nextSequence"
  `;
  const seq = rows[0]?.nextSequence;
  if (!seq) throw new Error(`No Quota row for ${distance}/${participantType}`);

  const padded = String(seq).padStart(4, '0');
  return `ECB26-${distanceCode(distance)}${participantTypeCode(participantType)}-${padded}`;
}
