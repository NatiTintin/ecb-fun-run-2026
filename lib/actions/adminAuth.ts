'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { adminLoginSchema } from '@/lib/validation';
import { authenticateAdmin, createAdminSession, destroyAdminSession } from '@/lib/auth/session';
import { rateLimit, clientIpFrom } from '@/lib/rateLimit';
import { AdminRole } from '@/lib/config';

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const ip = clientIpFrom(headers());
  if (!rateLimit(`admin-login:${ip}`, 10, 10 * 60 * 1000)) {
    return { error: 'มีการพยายามเข้าสู่ระบบถี่เกินไป กรุณาลองใหม่ภายหลัง' };
  }

  const parsed = adminLoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: 'กรุณากรอกอีเมลและรหัสผ่านให้ถูกต้อง' };

  const admin = await authenticateAdmin(parsed.data.email, parsed.data.password);
  if (!admin) return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };

  await createAdminSession({
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role as AdminRole,
  });

  redirect('/admin');
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect('/admin/login');
}
