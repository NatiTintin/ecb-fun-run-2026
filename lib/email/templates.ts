import { DISTANCE_LABEL, PARTICIPANT_TYPE_LABEL, Distance, ParticipantType } from '@/lib/config';

function layout(title: string, bodyHtml: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#FFFAF3;font-family:Arial,Helvetica,sans-serif;color:#1F2937;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#FF5A1F,#FFB800);border-radius:16px;padding:20px 24px;margin-bottom:20px;">
        <p style="margin:0;color:#fff;font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.9;">ECB Fun Run 2026</p>
        <h1 style="margin:6px 0 0;color:#fff;font-size:22px;">${title}</h1>
      </div>
      <div style="background:#fff;border-radius:16px;padding:24px;box-shadow:0 2px 12px rgba(31,41,55,0.08);">
        ${bodyHtml}
      </div>
      <p style="text-align:center;color:#9CA3AF;font-size:12px;margin-top:20px;">ECB Fun Run 2026 &middot; วันเสาร์ที่ 7 พฤศจิกายน 2026</p>
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

export function registrationReceivedEmail(args: {
  fullName: string;
  registrationId: string;
  distance: Distance;
  participantType: ParticipantType;
  shirtSize: string;
  fee: number;
  paymentStatusLabel: string;
  statusUrl: string;
}) {
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
      ${infoRow('สถานะการชำระเงิน', args.paymentStatusLabel)}
    </table>
    <p>เจ้าหน้าที่กำลังตรวจสอบข้อมูลและหลักฐานการชำระเงินของท่าน เมื่อได้รับการอนุมัติแล้ว ระบบจะส่ง Confirmation Email พร้อม QR Code ไปยังอีเมลนี้</p>
    <p style="margin-top:20px;"><a href="${args.statusUrl}" style="display:inline-block;background:#FF5A1F;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;">ดูสถานะการสมัคร</a></p>
    `
  );
  return { subject, html };
}

export function paymentReminderEmail(args: {
  fullName: string;
  registrationId: string;
  fee: number;
  statusUrl: string;
}) {
  const subject = 'ECB Fun Run 2026 – กรุณาชำระเงินและแนบหลักฐาน';
  const html = layout(
    subject,
    `
    <p>เรียนคุณ ${args.fullName},</p>
    <p>ระบบยังไม่ได้รับหลักฐานการชำระเงินสำหรับการสมัคร <strong>${args.registrationId}</strong> ยอดเงิน <strong>${args.fee.toLocaleString()} บาท</strong></p>
    <p>กรุณาชำระเงินและแนบหลักฐานการโอนผ่านลิงก์ด้านล่างเพื่อยืนยันการสมัครของท่าน</p>
    <p style="margin-top:20px;"><a href="${args.statusUrl}" style="display:inline-block;background:#FF5A1F;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;">ชำระเงิน / แนบหลักฐาน</a></p>
    <p style="color:#9CA3AF;font-size:12px;">ลิงก์นี้เป็นลิงก์เฉพาะของท่าน กรุณาอย่าส่งต่อให้ผู้อื่น</p>
    `
  );
  return { subject, html };
}

export function paymentIssueEmail(args: {
  fullName: string;
  registrationId: string;
  reason: string;
  statusUrl: string;
}) {
  const subject = 'ECB Fun Run 2026 – หลักฐานการชำระเงินมีปัญหา';
  const html = layout(
    subject,
    `
    <p>เรียนคุณ ${args.fullName},</p>
    <p>เจ้าหน้าที่ตรวจสอบหลักฐานการชำระเงินของการสมัคร <strong>${args.registrationId}</strong> และพบปัญหาดังนี้:</p>
    <p style="background:#FEF2F2;border:1px solid #FCA5A5;color:#B91C1C;border-radius:10px;padding:12px 14px;">${args.reason}</p>
    <p>กรุณาแนบหลักฐานการชำระเงินใหม่ผ่านลิงก์ด้านล่าง</p>
    <p style="margin-top:20px;"><a href="${args.statusUrl}" style="display:inline-block;background:#FF5A1F;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;">แนบหลักฐานใหม่</a></p>
    `
  );
  return { subject, html };
}

export function registrationApprovedEmail(args: {
  fullName: string;
  registrationId: string;
  distance: Distance;
  participantType: ParticipantType;
  shirtSize: string;
  qrCodeDataUrl: string;
  statusUrl: string;
}) {
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
    <p style="margin-top:12px;"><a href="${args.statusUrl}" style="display:inline-block;background:#FF5A1F;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;">ดู QR Code / บันทึกไว้ในมือถือ</a></p>
    `
  );
  return { subject, html };
}
