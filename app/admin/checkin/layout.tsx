import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/session';
import { logoutAction } from '@/lib/actions/adminAuth';

// Deliberately outside the (protected) group, which always renders the
// full sidebar nav — Event Day check-in runs on a dedicated device where
// staff just need this one screen, not the rest of the admin panel.
// Re-does the same auth check (protected)/layout.tsx does, since
// leaving that layout means losing it.
export default async function CheckinLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-5 py-3 bg-ink text-white">
        <Link href="/admin" className="text-sm font-bold text-brand-300">
          ← ECB Fun Run 2026
        </Link>
        <form action={logoutAction}>
          <button className="text-brand-300 hover:text-brand-200 text-sm font-semibold">ออกจากระบบ</button>
        </form>
      </header>
      {children}
    </div>
  );
}
