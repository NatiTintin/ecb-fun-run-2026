'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AdminRole } from '@/lib/config';

const ALL_ITEMS = [
  { href: '/admin', label: 'Dashboard', roles: ['SUPER_ADMIN', 'REGISTRATION_STAFF'] },
  { href: '/admin/registrations', label: 'Registrations', roles: ['SUPER_ADMIN', 'REGISTRATION_STAFF'] },
  { href: '/admin/reports', label: 'Reports', roles: ['SUPER_ADMIN', 'REGISTRATION_STAFF'] },
  { href: '/admin/checkin', label: 'BIB Check-in', roles: ['SUPER_ADMIN', 'REGISTRATION_STAFF', 'BIB_STAFF'] },
  { href: '/admin/emails', label: 'Email Outbox', roles: ['SUPER_ADMIN'] },
  { href: '/admin/admins', label: 'Admins', roles: ['SUPER_ADMIN'] },
  { href: '/admin/settings', label: 'Settings', roles: ['SUPER_ADMIN'] },
] as const;

export function AdminNav({ role }: { role: AdminRole }) {
  const pathname = usePathname();
  const items = ALL_ITEMS.filter((item) => (item.roles as readonly string[]).includes(role));

  return (
    <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible p-3 gap-1">
      {items.map((item) => {
        const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors',
              active ? 'bg-brand-500 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
