import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/session';
import { AdminNav } from '@/components/admin/AdminNav';
import { ADMIN_ROLE_LABEL } from '@/lib/config';
import { logoutAction } from '@/lib/actions/adminAuth';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <aside className="lg:w-64 lg:min-h-screen bg-ink text-white flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <Link href="/admin" className="block">
            <p className="text-xs uppercase tracking-widest text-brand-300 font-bold">ECB Fun Run 2026</p>
            <p className="font-extrabold">Admin</p>
          </Link>
        </div>
        <AdminNav role={session.role} />
        <div className="p-5 border-t border-white/10 mt-auto text-sm">
          <p className="font-semibold">{session.name}</p>
          <p className="text-white/60 text-xs">{ADMIN_ROLE_LABEL[session.role]}</p>
          <form action={logoutAction} className="mt-3">
            <button className="text-brand-300 hover:text-brand-200 text-sm font-semibold">ออกจากระบบ</button>
          </form>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
