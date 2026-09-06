import { Prisma, PrismaClient } from '@prisma/client';
import { db } from '@/lib/db';
import { Distance } from '@/lib/config';

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Mints the next sequential BIB number for a distance — 5001, 5002, ... for
 * KM5 and 3001, 3002, ... for KM3, shared across Adult/Child within that
 * distance. Uses the same atomic UPDATE ... RETURNING pattern as
 * nextRegistrationId so concurrent approvals never collide.
 */
export async function nextBibNumber(distance: Distance, tx: Db = db): Promise<number> {
  const rows = await tx.$queryRaw<{ nextNumber: number }[]>`
    UPDATE "BibSequence"
    SET "nextNumber" = "nextNumber" + 1
    WHERE "distance" = ${distance}
    RETURNING "nextNumber"
  `;
  const n = rows[0]?.nextNumber;
  if (!n) throw new Error(`No BibSequence row for ${distance}`);
  return n;
}
