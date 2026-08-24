import Link from 'next/link';
import { getEventSettings, computeRegistrationWindowState, priceFor } from '@/lib/settings';
import { getQuotaOverview, } from '@/lib/quota';
import { sweepExpiredReservations } from '@/lib/workflow';
import { DISTANCE_LABEL, PARTICIPANT_TYPE_LABEL, Distance, ParticipantType } from '@/lib/config';
import { formatTHB, formatThaiDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

const STEPS = [
  { title: 'Register', desc: 'กรอกข้อมูลและเลือกประเภทการแข่งขัน' },
  { title: 'Payment', desc: 'โอนเงินและแนบหลักฐานการชำระเงิน' },
  { title: 'Review', desc: 'เจ้าหน้าที่ตรวจสอบข้อมูลและการชำระเงิน' },
  { title: 'Confirmation', desc: 'เมื่อได้รับการอนุมัติ จะได้รับ Confirmation Email พร้อม QR Code' },
  { title: 'BIB Collection', desc: 'แสดง QR Code ในวันรับ BIB' },
];

const cardOrder: { distance: Distance; participantType: ParticipantType }[] = [
  { distance: 'KM5', participantType: 'ADULT' },
  { distance: 'KM5', participantType: 'CHILD' },
  { distance: 'KM3', participantType: 'ADULT' },
  { distance: 'KM3', participantType: 'CHILD' },
];

export default async function LandingPage() {
  await sweepExpiredReservations();
  const settings = await getEventSettings();
  const windowState = computeRegistrationWindowState(settings);
  const quotas = await getQuotaOverview();

  const windowBadge =
    windowState === 'OPEN' ? (
      <Badge tone="success">เปิดรับสมัครแล้ว</Badge>
    ) : windowState === 'UPCOMING' ? (
      <Badge tone="warning">Registration Opens Soon</Badge>
    ) : (
      <Badge tone="danger">Registration Closed</Badge>
    );

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-400 to-sunshine-400 text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_60%,white,transparent_30%)]" />
        <div className="relative max-w-3xl mx-auto px-6 py-16 sm:py-24 text-center">
          <p className="uppercase tracking-[0.2em] text-sm font-semibold text-white/90 mb-3">
            Fun Run · วิ่งสนุก · ทุกวัยร่วมสนุกได้
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold drop-shadow-sm">ECB Fun Run 2026</h1>
          <p className="mt-4 text-xl sm:text-2xl font-semibold">
            Saturday, 7 November 2026
          </p>
          <p className="mt-1 text-white/90">{formatThaiDate(settings.eventDate)}</p>

          <div className="mt-8 flex flex-col items-center gap-3">
            {windowBadge}
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                fullWidth
                disabled={windowState !== 'OPEN'}
                className="!bg-white !text-brand-600 hover:!bg-white/90 shadow-xl"
              >
                สมัครวิ่ง / Register Now
              </Button>
            </Link>
            <p className="text-sm text-white/85">
              ช่วงเปิดรับสมัคร: 13 September – 18 October 2026
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 py-12">
        <h2 className="text-2xl font-extrabold text-ink text-center mb-1">เลือกระยะการวิ่งของคุณ</h2>
        <p className="text-center text-gray-500 mb-6">Race Options</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cardOrder.map(({ distance, participantType }) => {
            const q = quotas.find(
              (x) => x.distance === distance && x.participantType === participantType
            );
            const price = priceFor(settings, distance, participantType);
            const tone = q?.status === 'FULL' ? 'danger' : q?.status === 'ALMOST_FULL' ? 'warning' : 'success';
            const label =
              q?.status === 'FULL' ? 'FULL / เต็ม' : q?.status === 'ALMOST_FULL' ? 'Almost Full' : 'Available';
            return (
              <Card key={`${distance}-${participantType}`} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-ink">
                    {DISTANCE_LABEL[distance]} {PARTICIPANT_TYPE_LABEL[participantType].split(' /')[0]}
                  </h3>
                  <Badge tone={tone}>{label}</Badge>
                </div>
                <p className="text-3xl font-extrabold text-brand-500">{formatTHB(price)}</p>
                <div className="text-sm text-gray-500 space-y-0.5">
                  <p>Quota: {q?.capacity ?? '-'} คน</p>
                  <p className="font-semibold text-ink">
                    {q ? `${q.remaining} spots remaining` : '-'}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-5 py-12">
          <h2 className="text-2xl font-extrabold text-ink text-center mb-1">ขั้นตอนการสมัคร</h2>
          <p className="text-center text-gray-500 mb-8">How It Works</p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {STEPS.map((step, i) => (
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
        <p>สอบถามข้อมูลเพิ่มเติม: {settings.organizerEmail} · {settings.organizerPhone}</p>
        {settings.lineContact && <p>LINE: {settings.lineContact}</p>}
        <p className="pt-2">
          <Link href="/admin/login" className="underline hover:text-brand-600">
            สำหรับเจ้าหน้าที่ / Staff Login
          </Link>
        </p>
      </footer>
    </main>
  );
}
