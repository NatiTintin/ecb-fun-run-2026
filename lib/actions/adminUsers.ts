'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin, hashPassword } from '@/lib/auth/session';
import { writeAuditLog } from '@/lib/audit';
import { ADMIN_ROLES, AdminRole } from '@/lib/config';

export type CreateAdminResult = { ok: boolean; error?: string };

export async function createAdminAction(
  _prevState: CreateAdminResult,
  formData: FormData
): Promise<CreateAdminResult> {
  const session = await requireAdmin(['SUPER_ADMIN']);
  if (!session) return { ok: false, error: 'Unauthorized' };

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? '') as AdminRole;

  if (!name) return { ok: false, error: 'กรุณากรอกชื่อ' };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'อีเมลไม่ถูกต้อง' };
  if (password.length < 8) return { ok: false, error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
  if (!ADMIN_ROLES.includes(role)) return { ok: false, error: 'กรุณาเลือกสิทธิ์การใช้งาน' };

  const existing = await db.admin.findUnique({ where: { email } });
  if (existing) return { ok: false, error: 'มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว' };

  const passwordHash = await hashPassword(password);
  const admin = await db.admin.create({ data: { name, email, passwordHash, role } });

  await writeAuditLog(db, {
    adminId: session.adminId,
    action: 'ADMIN_CREATED',
    newValue: { createdAdminId: admin.id, email: admin.email, role: admin.role },
  });

  revalidatePath('/admin/admins');
  return { ok: true };
}
