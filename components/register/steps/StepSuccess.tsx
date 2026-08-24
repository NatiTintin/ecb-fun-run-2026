import Link from 'next/link';
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
  return (
    <div className="max-w-lg mx-auto px-5 py-16 text-center space-y-5">
      <div className="text-6xl">🎉</div>
      <h1 className="text-2xl font-extrabold text-ink">ได้รับข้อมูลการสมัครแล้ว</h1>
      <Card className="bg-brand-50 border-brand-200">
        <p className="text-sm text-gray-500">Registration ID</p>
        <p className="text-2xl font-extrabold text-brand-600 tracking-wide">{registrationId}</p>
      </Card>
      <p className="text-gray-600 leading-relaxed">
        เจ้าหน้าที่กำลังตรวจสอบข้อมูลและหลักฐานการชำระเงิน เมื่อได้รับการอนุมัติแล้ว
        ระบบจะส่ง Confirmation Email และ QR Code ไปยัง Email ที่ลงทะเบียนไว้
      </p>
      {statusToken ? (
        <Link href={`${successHrefBase}/${statusToken}`}>
          <Button size="lg" fullWidth>
            ดูสถานะการสมัครของฉัน
          </Button>
        </Link>
      ) : (
        <Link href="/admin/registrations">
          <Button size="lg" fullWidth>
            กลับไปที่รายการผู้สมัคร
          </Button>
        </Link>
      )}
      <Link href="/" className="block text-sm text-gray-500 underline">
        กลับหน้าแรก
      </Link>
    </div>
  );
}
