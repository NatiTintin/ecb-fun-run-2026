import { getEventSettings, computeRegistrationWindowState } from '@/lib/settings';
import { getQuotaOverview } from '@/lib/quota';
import { sweepExpiredReservations } from '@/lib/workflow';
import { RegistrationWizard } from '@/components/register/RegistrationWizard';
import { RegistrationClosedNotice } from '@/components/register/RegistrationClosedNotice';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  await sweepExpiredReservations();
  const settings = await getEventSettings();
  const windowState = computeRegistrationWindowState(settings);
  const quotas = await getQuotaOverview();

  if (windowState !== 'OPEN') {
    return <RegistrationClosedNotice state={windowState} />;
  }

  return (
    <main className="min-h-screen pb-10">
      <RegistrationWizard
        quotas={quotas}
        pricing={{
          price5kmAdult: settings.price5kmAdult,
          price5kmChild: settings.price5kmChild,
          price3kmAdult: settings.price3kmAdult,
          price3kmChild: settings.price3kmChild,
        }}
        payment={{
          bankName: settings.bankName,
          bankAccountName: settings.bankAccountName,
          bankAccountNumber: settings.bankAccountNumber,
          promptPayNumber: settings.promptPayNumber,
          promptPayQrImageUrl: settings.promptPayQrImageUrl,
          paymentInstructions: settings.paymentInstructions,
        }}
      />
    </main>
  );
}
