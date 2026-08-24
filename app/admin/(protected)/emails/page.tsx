import { db } from '@/lib/db';
import { formatThaiDateTime } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export default async function EmailsPage() {
  const emails = await db.emailLog.findMany({ orderBy: { sentAt: 'desc' }, take: 100 });
  const usingResend = !!process.env.RESEND_API_KEY;

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Email Outbox</h1>
        <p className="text-sm text-gray-500">
          {usingResend
            ? 'RESEND_API_KEY is set — emails are actually sent via Resend, and also logged here.'
            : 'RESEND_API_KEY ยังไม่ได้ตั้งค่า — อีเมลจะไม่ถูกส่งจริง แต่จะถูกบันทึกไว้ที่นี่แทน (Dev Outbox)'}
        </p>
      </div>

      <div className="space-y-3">
        {emails.map((email) => (
          <details key={email.id} className="group">
            <Card className="p-0 overflow-hidden">
              <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50">
                <div className="min-w-0">
                  <p className="font-semibold text-ink truncate">{email.subject}</p>
                  <p className="text-xs text-gray-500 truncate">
                    to {email.toEmail} · {formatThaiDateTime(email.sentAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge tone="neutral">{email.kind}</Badge>
                  <Badge tone={email.success ? 'success' : 'danger'}>{email.provider}</Badge>
                </div>
              </summary>
              <div className="border-t border-gray-100">
                <iframe
                  title={email.id}
                  srcDoc={email.bodyHtml}
                  className="w-full h-96 bg-white"
                  sandbox=""
                />
              </div>
            </Card>
          </details>
        ))}
        {emails.length === 0 && <p className="text-gray-400">ยังไม่มีอีเมลที่ส่ง</p>}
      </div>
    </div>
  );
}
