import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/session';
import { toCsv } from '@/lib/csv';
import {
  DISTANCE_LABEL,
  PARTICIPANT_TYPE_LABEL,
  REGISTRATION_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  ID_TYPE_LABEL,
  calculateAge,
  Distance,
  ParticipantType,
  RegistrationStatus,
  PaymentStatus,
  IdType,
} from '@/lib/config';

function csvResponse(csv: string, filename: string) {
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const type = req.nextUrl.searchParams.get('type');

  if (type === 'registrations') {
    const participants = await db.participant.findMany({
      orderBy: { createdAt: 'desc' },
      include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 }, bib: true },
    });
    const rows = participants.map((p) => ({
      'Registration ID': p.registrationId,
      Name: p.fullName,
      Phone: p.phone,
      Email: p.email,
      Type: PARTICIPANT_TYPE_LABEL[p.participantType as ParticipantType],
      Distance: DISTANCE_LABEL[p.distance as Distance],
      Shirt: p.shirtSize,
      Amount: p.registrationFee,
      'Payment Status': PAYMENT_STATUS_LABEL[(p.payments[0]?.paymentStatus ?? 'NOT_PAID') as PaymentStatus],
      'Registration Status': REGISTRATION_STATUS_LABEL[p.registrationStatus as RegistrationStatus],
      'Submitted Date': p.createdAt.toISOString(),
      'BIB Status': p.bib?.collected ? 'Collected' : 'Not Collected',
    }));
    return csvResponse(toCsv(rows), 'registrations.csv');
  }

  if (type === 'shirts') {
    const participants = await db.participant.findMany({
      where: { registrationStatus: { notIn: ['REJECTED', 'CANCELLED'] } },
      select: { distance: true, participantType: true, shirtSize: true },
    });
    const counts = new Map<string, number>();
    for (const p of participants) {
      const key = `${p.distance}|${p.participantType}|${p.shirtSize}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const rows = [...counts.entries()].map(([key, count]) => {
      const [distance, participantType, shirtSize] = key.split('|');
      return {
        Distance: DISTANCE_LABEL[distance as Distance],
        Type: PARTICIPANT_TYPE_LABEL[participantType as ParticipantType],
        'Shirt Size': shirtSize,
        Count: count,
      };
    });
    return csvResponse(toCsv(rows), 'shirt-report.csv');
  }

  if (type === 'payments') {
    const participants = await db.participant.findMany({
      orderBy: { createdAt: 'desc' },
      include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    const rows = participants.map((p) => ({
      'Registration ID': p.registrationId,
      Name: p.fullName,
      Amount: p.registrationFee,
      'Payment Status': PAYMENT_STATUS_LABEL[(p.payments[0]?.paymentStatus ?? 'NOT_PAID') as PaymentStatus],
      'Verified At': p.payments[0]?.verifiedAt ? p.payments[0].verifiedAt.toISOString() : '',
    }));
    return csvResponse(toCsv(rows), 'payment-report.csv');
  }

  if (type === 'bib') {
    const participants = await db.participant.findMany({
      where: { registrationStatus: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: { bib: true },
    });
    const rows = participants.map((p) => ({
      'Registration ID': p.registrationId,
      Name: p.fullName,
      Distance: DISTANCE_LABEL[p.distance as Distance],
      Type: PARTICIPANT_TYPE_LABEL[p.participantType as ParticipantType],
      Collected: p.bib?.collected ? 'Yes' : 'No',
      'Collected At': p.bib?.collectedAt ? p.bib.collectedAt.toISOString() : '',
    }));
    return csvResponse(toCsv(rows), 'bib-report.csv');
  }

  if (type === 'insurance') {
    const participants = await db.participant.findMany({
      where: { registrationStatus: { notIn: ['REJECTED', 'CANCELLED'] } },
      orderBy: { createdAt: 'desc' },
    });
    const rows = participants.map((p) => ({
      'Registration ID': p.registrationId,
      Name: p.fullName,
      'Date of Birth': p.dateOfBirth.toISOString().slice(0, 10),
      'Age (years)': calculateAge(p.dateOfBirth),
      'ID Type': ID_TYPE_LABEL[p.idType as IdType],
      'ID / Passport Number': p.idNumber,
      Type: PARTICIPANT_TYPE_LABEL[p.participantType as ParticipantType],
      Distance: DISTANCE_LABEL[p.distance as Distance],
      Phone: p.phone,
      Email: p.email,
    }));
    return csvResponse(toCsv(rows), 'insurance-report.csv');
  }

  return NextResponse.json({ error: 'Unknown report type' }, { status: 400 });
}
