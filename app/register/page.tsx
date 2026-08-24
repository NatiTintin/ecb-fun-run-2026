import Link from 'next/link';
import { getEventSettings, computeRegistrationWindowState } from '@/lib/settings';
import { getQuotaOverview } from '@/lib/quota';
import { sweepExpiredReservations } from '@/lib/workflow';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RegistrationWizard } from '@/components/register/RegistrationWizard';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  await sweepExpiredReservations();
  const settings = await getEventSettings();
  const windowState = computeRegistrationWindowState(settings);
  const quotas = await getQuotaOverview();

  if (windowState !== 'OPEN') {
    return (
      <main className="min-h-screen flex items-center justify-center px-5 py-16">
        <Card className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-bold text-ink">
            {windowState === 'UPCOMING' ? 'Registration Opens Soon' : 'Registration Closed'}
          </h1>
          <p className="text-gray-500">
            {windowState === 'UPCOMING'
              ? 'ระบบจะเปิดรับสมัครวันที่ 13 กันยายน 2026 กรุณากลับมาใหม่อีกครั้ง'
              : 'ขณะนี้ปิดรับสมัครแล้ว ขอบคุณที่ให้ความสนใจ ECB Fun Run 2026'}
          </p>
          <Link href="/">
            <Button variant="outline" fullWidth>
              กลับหน้าแรก
            </Button>
          </Link>
        </Card>
      </main>
    );
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
        consentText={{
          health: settings.consentTextHealth,
          marketing: settings.consentTextMarketing,
          communication: settings.consentTextCommunication,
        }}
      />
    </main>
  );
}
