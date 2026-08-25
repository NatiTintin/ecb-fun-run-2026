import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { ADMIN_ROLE_LABEL, AdminRole } from '@/lib/config';
import { formatThaiDateTime } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CreateAdminForm } from '@/components/admin/CreateAdminForm';

export const dynamic = 'force-dynamic';

export default async function AdminsPage() {
  const session = await requireAdmin(['SUPER_ADMIN']);
  if (!session) redirect('/admin/login');

  const admins = await db.admin.findMany({ orderBy: { createdAt: 'asc' } });

  return (
    <div className="p-5 lg:p-8 max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink mb-1">Admins</h1>
        <p className="text-sm text-gray-500">จัดการบัญชีแอดมินที่เข้าใช้งานระบบนี้</p>
      </div>

      <Card className="space-y-3">
        <h2 className="font-bold text-ink">บัญชีทั้งหมด ({admins.length})</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left font-semibold px-3 py-2.5">ชื่อ</th>
                <th className="text-left font-semibold px-3 py-2.5">อีเมล</th>
                <th className="text-left font-semibold px-3 py-2.5">สิทธิ์</th>
                <th className="text-left font-semibold px-3 py-2.5">สร้างเมื่อ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-3 py-2.5 font-semibold text-ink">
                    {admin.name}
                    {admin.id === session.adminId && <span className="text-gray-400 font-normal"> (คุณ)</span>}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">{admin.email}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone="neutral">{ADMIN_ROLE_LABEL[admin.role as AdminRole]}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">{formatThaiDateTime(admin.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateAdminForm />
    </div>
  );
}
