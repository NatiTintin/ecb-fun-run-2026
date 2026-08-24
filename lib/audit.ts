import { Prisma, PrismaClient } from '@prisma/client';
import { db } from '@/lib/db';

type Db = PrismaClient | Prisma.TransactionClient;

export async function writeAuditLog(
  tx: Db,
  entry: {
    adminId?: string | null;
    participantId?: string | null;
    action: string;
    previousValue?: unknown;
    newValue?: unknown;
    note?: string | null;
  }
) {
  await tx.auditLog.create({
    data: {
      adminId: entry.adminId ?? null,
      participantId: entry.participantId ?? null,
      action: entry.action,
      previousValue: entry.previousValue !== undefined ? JSON.stringify(entry.previousValue) : null,
      newValue: entry.newValue !== undefined ? JSON.stringify(entry.newValue) : null,
      note: entry.note ?? null,
    },
  });
}

export { db };
