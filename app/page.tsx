import { getEventSettings, computeRegistrationWindowState } from '@/lib/settings';
import { getQuotaOverview } from '@/lib/quota';
import { sweepExpiredReservations } from '@/lib/workflow';
import { LandingContent } from '@/components/landing/LandingContent';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  await sweepExpiredReservations();
  const settings = await getEventSettings();
  const windowState = computeRegistrationWindowState(settings);
  const quotas = await getQuotaOverview();

  return (
    <LandingContent
      windowState={windowState}
      quotas={quotas}
      pricing={{
        price5kmAdult: settings.price5kmAdult,
        price5kmChild: settings.price5kmChild,
        price3kmAdult: settings.price3kmAdult,
        price3kmChild: settings.price3kmChild,
      }}
      organizerEmail={settings.organizerEmail}
      organizerPhone={settings.organizerPhone}
      lineContact={settings.lineContact}
    />
  );
}
