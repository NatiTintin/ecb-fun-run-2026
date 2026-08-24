import { getEventSettings } from '@/lib/settings';
import { getQuotaOverview } from '@/lib/quota';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getEventSettings();
  const quotas = await getQuotaOverview();

  return (
    <div className="p-5 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-ink mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">แก้ไขการตั้งค่างานได้โดยไม่ต้องแก้ไขโค้ด</p>
      <SettingsForm settings={settings} quotas={quotas} />
    </div>
  );
}
