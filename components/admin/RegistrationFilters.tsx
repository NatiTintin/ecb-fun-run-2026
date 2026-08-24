'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  DISTANCES,
  DISTANCE_LABEL,
  PARTICIPANT_TYPES,
  PARTICIPANT_TYPE_LABEL,
  SHIRT_SIZES,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABEL,
  REGISTRATION_STATUSES,
  REGISTRATION_STATUS_LABEL,
} from '@/lib/config';

const selectClass =
  'h-10 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-300';

export function RegistrationFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && setParam('q', q)}
        onBlur={() => setParam('q', q)}
        placeholder="ค้นหาชื่อ / Registration ID / เบอร์โทร / อีเมล"
        className="h-10 flex-1 min-w-[220px] rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
      />
      <select
        className={selectClass}
        defaultValue={searchParams.get('distance') ?? ''}
        onChange={(e) => setParam('distance', e.target.value)}
      >
        <option value="">ระยะทั้งหมด</option>
        {DISTANCES.map((d) => (
          <option key={d} value={d}>
            {DISTANCE_LABEL[d]}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        defaultValue={searchParams.get('participantType') ?? ''}
        onChange={(e) => setParam('participantType', e.target.value)}
      >
        <option value="">ประเภททั้งหมด</option>
        {PARTICIPANT_TYPES.map((t) => (
          <option key={t} value={t}>
            {PARTICIPANT_TYPE_LABEL[t]}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        defaultValue={searchParams.get('shirtSize') ?? ''}
        onChange={(e) => setParam('shirtSize', e.target.value)}
      >
        <option value="">ขนาดเสื้อทั้งหมด</option>
        {SHIRT_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        defaultValue={searchParams.get('paymentStatus') ?? ''}
        onChange={(e) => setParam('paymentStatus', e.target.value)}
      >
        <option value="">Payment ทั้งหมด</option>
        {PAYMENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {PAYMENT_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        defaultValue={searchParams.get('registrationStatus') ?? ''}
        onChange={(e) => setParam('registrationStatus', e.target.value)}
      >
        <option value="">Status ทั้งหมด</option>
        {REGISTRATION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {REGISTRATION_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        defaultValue={searchParams.get('bibStatus') ?? ''}
        onChange={(e) => setParam('bibStatus', e.target.value)}
      >
        <option value="">BIB ทั้งหมด</option>
        <option value="COLLECTED">Collected</option>
        <option value="NOT_COLLECTED">Not Collected</option>
      </select>
      <select
        className={selectClass}
        defaultValue={searchParams.get('sort') ?? 'date_desc'}
        onChange={(e) => setParam('sort', e.target.value)}
      >
        <option value="date_desc">วันที่สมัคร (ล่าสุดก่อน)</option>
        <option value="date_asc">วันที่สมัคร (เก่าก่อน)</option>
        <option value="name_asc">ชื่อ A-Z</option>
        <option value="name_desc">ชื่อ Z-A</option>
        <option value="distance_asc">ระยะ</option>
        <option value="status_asc">สถานะ</option>
      </select>
    </div>
  );
}
