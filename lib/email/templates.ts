import { DISTANCE_LABEL, PARTICIPANT_TYPE_LABEL, PAYMENT_STATUS_LABEL_EN, Distance, ParticipantType } from '@/lib/config';
import { Locale } from '@/lib/i18n/dictionaries';

function layout(title: string, bodyHtml: string, footerLine: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#FFFAF3;font-family:Arial,Helvetica,sans-serif;color:#1F2937;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#0A1830,#173A63);border-radius:16px;padding:20px 24px;margin-bottom:20px;">
        <p style="margin:0;color:#E4D09B;font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.9;">ECB Fun Run 2026</p>
        <h1 style="margin:6px 0 0;color:#fff;font-size:22px;">${title}</h1>
      </div>
      <div style="background:#fff;border-radius:16px;padding:24px;box-shadow:0 2px 12px rgba(31,41,55,0.08);">
        ${bodyHtml}
      </div>
      <p style="text-align:center;color:#9CA3AF;font-size:12px;margin-top:20px;">${footerLine}</p>
    </div>
  </body>
</html>`;
}

function infoRow(label: string, value: string) {
  return `<tr>
    <td style="padding:6px 0;color:#6B7280;font-size:14px;">${label}</td>
    <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${value}</td>
  </tr>`;
}

const FOOTER: Record<Locale, string> = {
  en: 'ECB Fun Run 2026 · Saturday, 7 November 2026',
  th: 'ECB Fun Run 2026 &middot; วันเสาร์ที่ 7 พฤศจิกายน 2026',
};

export function registrationReceivedEmail(args: {
  locale: Locale;
  fullName: string;
  registrationId: string;
  distance: Distance;
  participantType: ParticipantType;
  shirtSize: string;
  fee: number;
  statusUrl: string;
}) {
  if (args.locale === 'th') {
    const subject = 'ECB Fun Run 2026 – Registration Received';
    const html = layout(
      subject,
      `
      <p>เรียนคุณ ${args.fullName},</p>
      <p>ทีมงาน ECB Fun Run 2026 ได้รับข้อมูลการสมัครของท่านเรียบร้อยแล้ว</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${infoRow('Registration ID', args.registrationId)}
        ${infoRow('ระยะ', DISTANCE_LABEL[args.distance])}
        ${infoRow('ประเภท', PARTICIPANT_TYPE_LABEL[args.participantType])}
        ${infoRow('ขนาดเสื้อ', args.shirtSize)}
        ${infoRow('ค่าสมัคร', `${args.fee.toLocaleString()} บาท`)}
        ${infoRow('สถานะการชำระเงิน', 'ยังไม่ชำระเงิน')}
      </table>
      <p>เจ้าหน้าที่กำลังตรวจสอบข้อมูลและหลักฐานการชำระเงินของท่าน เมื่อได้รับการอนุมัติแล้ว ระบบจะส่ง Confirmation Email พร้อม QR Code ไปยังอีเมลนี้</p>
      <p style="margin-top:20px;"><a href="${args.statusUrl}" style="display:inline-block;background:#BC9245;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;">ดูสถานะการสมัคร</a></p>
      `,
      FOOTER.th
    );
    return { subject, html };
  }

  const subject = 'ECB Fun Run 2026 – Registration Received';
  const html = layout(
    subject,
    `
    <p>Dear ${args.fullName},</p>
    <p>We’ve received your registration for ECB Fun Run 2026.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${infoRow('Registration ID', args.registrationId)}
      ${infoRow('Distance', DISTANCE_LABEL[args.distance])}
      ${infoRow('Type', PARTICIPANT_TYPE_LABEL[args.participantType])}
      ${infoRow('Shirt Size', args.shirtSize)}
      ${infoRow('Registration Fee', `${args.fee.toLocaleString()} THB`)}
      ${infoRow('Payment Status', PAYMENT_STATUS_LABEL_EN.NOT_PAID)}
    </table>
    <p>Our staff are reviewing your information and payment proof. Once approved, you will receive a Confirmation Email with a QR Code sent to this address.</p>
    <p style="margin-top:20px;"><a href="${args.statusUrl}" style="display:inline-block;background:#BC9245;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;">View Registration Status</a></p>
    `,
    FOOTER.en
  );
  return { subject, html };
}

export function paymentReminderEmail(args: {
  locale: Locale;
  fullName: string;
  registrationId: string;
  fee: number;
  statusUrl: string;
}) {
  if (args.locale === 'th') {
    const subject = 'ECB Fun Run 2026 – กรุณาชำระเงินและแนบหลักฐาน';
    const html = layout(
      subject,
      `
      <p>เรียนคุณ ${args.fullName},</p>
      <p>ระบบยังไม่ได้รับหลักฐานการชำระเงินสำหรับการสมัคร <strong>${args.registrationId}</strong> ยอดเงิน <strong>${args.fee.toLocaleString()} บาท</strong></p>
      <p>กรุณาชำระเงินและแนบหลักฐานการโอนผ่านลิงก์ด้านล่างเพื่อยืนยันการสมัครของท่าน</p>
      <p style="margin-top:20px;"><a href="${args.statusUrl}" style="display:inline-block;background:#BC9245;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;">ชำระเงิน / แนบหลักฐาน</a></p>
      <p style="color:#9CA3AF;font-size:12px;">ลิงก์นี้เป็นลิงก์เฉพาะของท่าน กรุณาอย่าส่งต่อให้ผู้อื่น</p>
      `,
      FOOTER.th
    );
    return { subject, html };
  }

  const subject = 'ECB Fun Run 2026 – Please Complete Your Payment';
  const html = layout(
    subject,
    `
    <p>Dear ${args.fullName},</p>
    <p>We haven’t yet received payment proof for registration <strong>${args.registrationId}</strong>, amount <strong>${args.fee.toLocaleString()} THB</strong>.</p>
    <p>Please complete your payment and attach proof via the link below to confirm your registration.</p>
    <p style="margin-top:20px;"><a href="${args.statusUrl}" style="display:inline-block;background:#BC9245;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;">Pay / Attach Payment Proof</a></p>
    <p style="color:#9CA3AF;font-size:12px;">This is your personal link — please don’t share it with anyone else.</p>
    `,
    FOOTER.en
  );
  return { subject, html };
}

export function paymentIssueEmail(args: {
  locale: Locale;
  fullName: string;
  registrationId: string;
  reason: string;
  statusUrl: string;
}) {
  if (args.locale === 'th') {
    const subject = 'ECB Fun Run 2026 – หลักฐานการชำระเงินมีปัญหา';
    const html = layout(
      subject,
      `
      <p>เรียนคุณ ${args.fullName},</p>
      <p>เจ้าหน้าที่ตรวจสอบหลักฐานการชำระเงินของการสมัคร <strong>${args.registrationId}</strong> และพบปัญหาดังนี้:</p>
      <p style="background:#FEF2F2;border:1px solid #FCA5A5;color:#B91C1C;border-radius:10px;padding:12px 14px;">${args.reason}</p>
      <p>กรุณาแนบหลักฐานการชำระเงินใหม่ผ่านลิงก์ด้านล่าง</p>
      <p style="margin-top:20px;"><a href="${args.statusUrl}" style="display:inline-block;background:#BC9245;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;">แนบหลักฐานใหม่</a></p>
      `,
      FOOTER.th
    );
    return { subject, html };
  }

  const subject = 'ECB Fun Run 2026 – Issue With Your Payment Proof';
  const html = layout(
    subject,
    `
    <p>Dear ${args.fullName},</p>
    <p>Our staff reviewed the payment proof for registration <strong>${args.registrationId}</strong> and found an issue:</p>
    <p style="background:#FEF2F2;border:1px solid #FCA5A5;color:#B91C1C;border-radius:10px;padding:12px 14px;">${args.reason}</p>
    <p>Please attach a new payment proof via the link below.</p>
    <p style="margin-top:20px;"><a href="${args.statusUrl}" style="display:inline-block;background:#BC9245;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;">Attach New Payment Proof</a></p>
    `,
    FOOTER.en
  );
  return { subject, html };
}

export function registrationApprovedEmail(args: {
  locale: Locale;
  fullName: string;
  registrationId: string;
  distance: Distance;
  participantType: ParticipantType;
  shirtSize: string;
  qrCodeDataUrl: string;
  statusUrl: string;
}) {
  if (args.locale === 'th') {
    const subject = 'ECB Fun Run 2026 – Registration Confirmed';
    const html = layout(
      subject,
      `
      <p>เรียนคุณ ${args.fullName},</p>
      <p>ยินดีด้วย! การสมัครของท่านได้รับการอนุมัติแล้ว 🎉</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${infoRow('Registration ID', args.registrationId)}
        ${infoRow('ระยะ', DISTANCE_LABEL[args.distance])}
        ${infoRow('ประเภท', PARTICIPANT_TYPE_LABEL[args.participantType])}
        ${infoRow('ขนาดเสื้อ', args.shirtSize)}
        ${infoRow('สถานะ', 'CONFIRMED')}
      </table>
      <div style="text-align:center;margin:20px 0;">
        <img src="${args.qrCodeDataUrl}" alt="QR Code" style="width:220px;height:220px;border-radius:12px;border:1px solid #E5E7EB;" />
        <p style="color:#374151;font-weight:600;margin-top:10px;">กรุณาแสดง QR Code นี้ในวันรับ BIB</p>
      </div>
      <p style="margin-top:12px;"><a href="${args.statusUrl}" style="display:inline-block;background:#BC9245;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;">ดู QR Code / บันทึกไว้ในมือถือ</a></p>
      `,
      FOOTER.th
    );
    return { subject, html };
  }

  const subject = 'ECB Fun Run 2026 – Registration Confirmed';
  const html = layout(
    subject,
    `
    <p>Dear ${args.fullName},</p>
    <p>Congratulations — your registration has been approved! 🎉</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${infoRow('Registration ID', args.registrationId)}
      ${infoRow('Distance', DISTANCE_LABEL[args.distance])}
      ${infoRow('Type', PARTICIPANT_TYPE_LABEL[args.participantType])}
      ${infoRow('Shirt Size', args.shirtSize)}
      ${infoRow('Status', 'CONFIRMED')}
    </table>
    <div style="text-align:center;margin:20px 0;">
      <img src="${args.qrCodeDataUrl}" alt="QR Code" style="width:220px;height:220px;border-radius:12px;border:1px solid #E5E7EB;" />
      <p style="color:#374151;font-weight:600;margin-top:10px;">Please show this QR Code on BIB collection day.</p>
    </div>
    <p style="margin-top:12px;"><a href="${args.statusUrl}" style="display:inline-block;background:#BC9245;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;">View / Save QR Code</a></p>
    `,
    FOOTER.en
  );
  return { subject, html };
}
