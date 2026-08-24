'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { priceFor } from '@/lib/settings';
import { DISTANCE_LABEL, PARTICIPANT_TYPE_LABEL, Distance, ParticipantType } from '@/lib/config';
import { formatTHB } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { QuotaOverviewItem, PricingInfo } from '@/components/register/types';

const cardOrder: { distance: Distance; participantType: ParticipantType }[] = [
  { distance: 'KM5', participantType: 'ADULT' },
  { distance: 'KM5', participantType: 'CHILD' },
  { distance: 'KM3', participantType: 'ADULT' },
  { distance: 'KM3', participantType: 'CHILD' },
];

export function LandingContent({
  windowState,
  quotas,
  pricing,
  organizerEmail,
  organizerPhone,
  lineContact,
}: {
  windowState: 'UPCOMING' | 'OPEN' | 'CLOSED';
  quotas: QuotaOverviewItem[];
  pricing: PricingInfo;
  organizerEmail: string;
  organizerPhone: string;
  lineContact: string;
}) {
  const { dict } = useLanguage();

  const windowBadge =
    windowState === 'OPEN' ? (
      <Badge tone="success">{dict.hero.statusOpen}</Badge>
    ) : windowState === 'UPCOMING' ? (
      <Badge tone="warning">{dict.hero.statusUpcoming}</Badge>
    ) : (
      <Badge tone="danger">{dict.hero.statusClosed}</Badge>
    );

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white">
        <div className="absolute inset-0 opacity-[0.08] [background:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_60%,white,transparent_30%)]" />

        <div className="relative flex items-center justify-between px-5 py-5 max-w-3xl mx-auto">
          <Image src="/logo.png" alt="ECB — 60 Years" width={40} height={40} className="h-10 w-auto" priority />
          <LanguageSwitcher tone="dark" />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 pb-16 sm:pb-24 text-center">
          <Image
            src="/logo.png"
            alt="ECB — Celebrating 60 Years, Est. 1966"
            width={140}
            height={140}
            className="h-28 w-auto sm:h-36 mx-auto mb-6"
            priority
          />
          <p className="uppercase tracking-[0.15em] text-sm font-semibold text-brand-300 mb-3">{dict.hero.eyebrow}</p>
          <h1 className="text-4xl sm:text-6xl font-extrabold drop-shadow-sm">{dict.hero.title}</h1>
          <p className="mt-4 text-xl sm:text-2xl font-semibold">{dict.hero.dateLine}</p>

          <div className="mt-8 flex flex-col items-center gap-3">
            {windowBadge}
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                fullWidth
                disabled={windowState !== 'OPEN'}
                className="!bg-white !text-navy-800 hover:!bg-white/90 shadow-xl"
              >
                {dict.hero.cta}
              </Button>
            </Link>
            <p className="text-sm text-white/85">{dict.hero.registrationPeriod}</p>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-14 text-center">
          <p className="uppercase tracking-[0.15em] text-sm font-semibold text-brand-600 mb-2">{dict.about.eyebrow}</p>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line max-w-2xl mx-auto">{dict.about.body}</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 py-12">
        <h2 className="text-2xl font-extrabold text-ink text-center mb-1">{dict.raceOptions.title}</h2>
        <p className="text-center text-gray-500 mb-6">{dict.raceOptions.subtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cardOrder.map(({ distance, participantType }) => {
            const q = quotas.find((x) => x.distance === distance && x.participantType === participantType);
            const price = priceFor(pricing, distance, participantType);
            const tone = q?.status === 'FULL' ? 'danger' : q?.status === 'ALMOST_FULL' ? 'warning' : 'success';
            const label =
              q?.status === 'FULL' ? dict.raceOptions.full : q?.status === 'ALMOST_FULL' ? dict.raceOptions.almostFull : dict.raceOptions.available;
            return (
              <Card key={`${distance}-${participantType}`} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-ink">
                    {DISTANCE_LABEL[distance]} {PARTICIPANT_TYPE_LABEL[participantType].split(' /')[0]}
                  </h3>
                  <Badge tone={tone}>{label}</Badge>
                </div>
                <p className="text-3xl font-extrabold text-brand-600">{formatTHB(price)}</p>
                <div className="text-sm text-gray-500 space-y-0.5">
                  <p>
                    {dict.raceOptions.quota}: {q?.capacity ?? '-'}
                  </p>
                  <p className="font-semibold text-ink">
                    {q ? `${q.remaining} ${dict.raceOptions.remaining}` : '-'}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-5 py-12">
          <h2 className="text-2xl font-extrabold text-ink text-center mb-1">{dict.howItWorks.title}</h2>
          <p className="text-center text-gray-500 mb-8">{dict.howItWorks.subtitle}</p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {dict.howItWorks.steps.map((step, i) => (
              <div key={step.title} className="flex sm:flex-col items-start sm:items-center gap-3 sm:text-center">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div>
                  <p className="font-bold text-ink">{step.title}</p>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="max-w-4xl mx-auto px-5 py-10 text-center text-sm text-gray-500 space-y-2">
        <p>
          {dict.footer.contact} {organizerEmail} · {organizerPhone}
        </p>
        {lineContact && <p>LINE: {lineContact}</p>}
        <p className="pt-2">
          <Link href="/admin/login" className="underline hover:text-brand-600">
            {dict.nav.staffLogin}
          </Link>
        </p>
      </footer>
    </main>
  );
}
