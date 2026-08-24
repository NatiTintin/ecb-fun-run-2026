import { getEventSettings } from '@/lib/settings';
import { getQuotaOverview } from '@/lib/quota';
import { RegistrationWizard } from '@/components/register/RegistrationWizard';
import { createManualRegistrationAction } from '@/lib/actions/adminRegistrations';

export const dynamic = 'force-dynamic';

export default async function NewRegistrationPage() {
  const settings = await getEventSettings();
  const quotas = await getQuotaOverview();

  return (
    <div>
      <div className="p-5 lg:p-8 pb-0">
        <h1 className="text-2xl font-extrabold text-ink">เพิ่มผู้สมัครโดยเจ้าหน้าที่</h1>
        <p className="text-sm text-gray-500">Manual Registration — บันทึกเป็น &ldquo;Created by Admin&rdquo; พร้อม Audit Log</p>
      </div>
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
        childMaxAgeYears={settings.childMaxAgeYears}
        submitFn={createManualRegistrationAction}
      />
    </div>
  );
}
