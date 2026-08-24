import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  await db.eventSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      eventName: 'ECB Fun Run 2026',
      eventDate: new Date('2026-11-07T00:00:00+07:00'),
      registrationOpenAt: new Date('2026-09-13T00:00:00+07:00'),
      registrationCloseAt: new Date('2026-10-18T23:59:59+07:00'),
      registrationOverride: 'AUTO',
      reservationExpiryMinutes: 60,
      childCriteriaNote: '',
      price5kmAdult: 790,
      price5kmChild: 490,
      price3kmAdult: 590,
      price3kmChild: 290,
      bankName: '',
      bankAccountName: '',
      bankAccountNumber: '',
      promptPayNumber: '',
      promptPayQrImageUrl: '',
      paymentInstructions: 'กรุณาโอนเงินตามยอดที่ระบุ แล้วแนบหลักฐานการโอนในขั้นตอนถัดไป',
      organizerEmail: 'contact@ecbfunrun.example',
      organizerPhone: '02-000-0000',
      lineContact: '@ecbfunrun',
      emailSenderName: 'ECB Fun Run 2026',
      emailReplyTo: 'noreply@ecbfunrun.example',
      consentPolicyVersion: '1.0',
      consentTextHealth:
        'ข้าพเจ้ายินยอมให้ ECB Fun Run เก็บรวบรวม ใช้ และประมวลผลข้อมูลสุขภาพและข้อมูลความพร้อมทางร่างกายจาก PAR-Q เพื่อวัตถุประสงค์ด้านความปลอดภัยในการเข้าร่วมกิจกรรม',
      consentTextMarketing:
        'ข้าพเจ้ายินยอมให้ผู้จัดงานบันทึกภาพถ่ายหรือวิดีโอของข้าพเจ้าระหว่างการจัดกิจกรรม และนำภาพหรือวิดีโอดังกล่าวไปใช้เพื่อวัตถุประสงค์ด้านการประชาสัมพันธ์และการตลาด เช่น Facebook, Instagram, LINE หรือช่องทางสื่อสารของผู้จัดงาน',
      consentTextCommunication:
        'ข้าพเจ้ายินยอมให้จัดเก็บข้อมูลการติดต่อของข้าพเจ้าเพื่อใช้สำหรับการติดต่อเกี่ยวกับกิจกรรม การแจ้งสถานะการสมัคร และการติดต่อในกรณีจำเป็น',
    },
  });

  const quotas: Array<{ distance: string; participantType: string; capacity: number }> = [
    { distance: 'KM5', participantType: 'ADULT', capacity: 150 },
    { distance: 'KM5', participantType: 'CHILD', capacity: 20 },
    { distance: 'KM3', participantType: 'ADULT', capacity: 150 },
    { distance: 'KM3', participantType: 'CHILD', capacity: 20 },
  ];

  for (const q of quotas) {
    await db.quota.upsert({
      where: { distance_participantType: { distance: q.distance, participantType: q.participantType } },
      update: { capacity: q.capacity },
      create: { ...q, reservedCount: 0, approvedCount: 0, nextSequence: 0 },
    });
  }

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@ecbfunrun.example').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await db.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Super Admin',
      email: adminEmail,
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Seed complete.');
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
