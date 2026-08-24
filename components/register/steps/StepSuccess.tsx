'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function StepSuccess({
  registrationId,
  statusToken,
  successHrefBase = '/status',
}: {
  registrationId: string;
  statusToken?: string;
  successHrefBase?: string;
}) {
  const { dict } = useLanguage();
  const t = dict.register.success;

  return (
    <div className="max-w-lg mx-auto px-5 py-16 text-center space-y-5">
      <div className="text-6xl">🎉</div>
      <h1 className="text-2xl font-extrabold text-ink">{t.heading}</h1>
      <Card className="bg-brand-50 border-brand-200">
        <p className="text-sm text-gray-500">{t.registrationId}</p>
        <p className="text-2xl font-extrabold text-brand-600 tracking-wide">{registrationId}</p>
      </Card>
      <p className="text-gray-600 leading-relaxed">{t.body}</p>
      {statusToken ? (
        <Link href={`${successHrefBase}/${statusToken}`}>
          <Button size="lg" fullWidth>
            {t.viewStatus}
          </Button>
        </Link>
      ) : (
        <Link href="/admin/registrations">
          <Button size="lg" fullWidth>
            {t.backToAdminList}
          </Button>
        </Link>
      )}
      <Link href="/" className="block text-sm text-gray-500 underline">
        {dict.common.backToHome}
      </Link>
    </div>
  );
}
