'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function RegistrationClosedNotice({ state }: { state: 'UPCOMING' | 'CLOSED' }) {
  const { dict } = useLanguage();
  const key = state === 'UPCOMING' ? 'upcoming' : 'closed';

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-16">
      <Card className="max-w-md text-center space-y-3">
        <h1 className="text-xl font-bold text-ink">{dict.register.closedTitle[key]}</h1>
        <p className="text-gray-500">{dict.register.closedBody[key]}</p>
        <Link href="/">
          <Button variant="outline" fullWidth>
            {dict.common.backToHome}
          </Button>
        </Link>
      </Card>
    </main>
  );
}
