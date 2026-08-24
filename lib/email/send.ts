import { db } from '@/lib/db';

export type EmailKind = 'RECEIVED' | 'PAYMENT_REMINDER' | 'PAYMENT_ISSUE' | 'APPROVED';

/**
 * Sends a transactional email. With no RESEND_API_KEY set (the default for
 * local dev), emails are written to EmailLog instead of actually sending —
 * viewable at /admin/emails — so the full flow (including the QR code
 * image) can be exercised without an email provider account.
 */
export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  kind: EmailKind;
  participantId?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  let success = true;
  let provider: 'DEV' | 'RESEND' = 'DEV';

  if (apiKey) {
    provider = 'RESEND';
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);
      const settings = await db.eventSettings.findUnique({ where: { id: 'singleton' } });
      const from = settings?.emailSenderName
        ? `${settings.emailSenderName} <${settings.emailReplyTo || 'noreply@ecbfunrun.example'}>`
        : 'ECB Fun Run 2026 <noreply@ecbfunrun.example>';
      await resend.emails.send({ from, to: args.to, subject: args.subject, html: args.html });
    } catch (err) {
      success = false;
      console.error('Failed to send email via Resend', err);
    }
  }

  await db.emailLog.create({
    data: {
      participantId: args.participantId,
      toEmail: args.to,
      subject: args.subject,
      bodyHtml: args.html,
      kind: args.kind,
      provider,
      success,
    },
  });

  return { success, provider };
}
