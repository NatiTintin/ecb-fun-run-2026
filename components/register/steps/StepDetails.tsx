'use client';

import { RegistrationDraft } from '@/components/register/types';
import { Field, inputBaseClass } from '@/components/ui/Field';

export function StepDetails({
  draft,
  update,
  errors,
}: {
  draft: RegistrationDraft;
  update: (patch: Partial<RegistrationDraft>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-ink">ข้อมูลผู้สมัคร</h2>
        <p className="text-sm text-gray-500">Participant Information</p>
      </div>

      <Field label="ชื่อ-นามสกุล / Full Name" htmlFor="fullName" required error={errors.fullName}>
        <input
          id="fullName"
          className={inputBaseClass(!!errors.fullName)}
          value={draft.fullName}
          onChange={(e) => update({ fullName: e.target.value })}
          placeholder="เช่น สมชาย ใจดี"
          autoComplete="name"
        />
      </Field>

      <Field
        label="เบอร์โทรศัพท์ / Phone Number"
        htmlFor="phone"
        required
        error={errors.phone}
        hint="รองรับเบอร์มือถือไทย เช่น 081-234-5678"
      >
        <input
          id="phone"
          className={inputBaseClass(!!errors.phone)}
          value={draft.phone}
          onChange={(e) => update({ phone: e.target.value })}
          placeholder="081-234-5678"
          inputMode="tel"
          autoComplete="tel"
        />
      </Field>

      <Field
        label="อีเมล / Email"
        htmlFor="email"
        required
        error={errors.email}
        hint="ใช้สำหรับส่งสถานะการสมัครและ QR Code"
      >
        <input
          id="email"
          type="email"
          className={inputBaseClass(!!errors.email)}
          value={draft.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </Field>
    </div>
  );
}
