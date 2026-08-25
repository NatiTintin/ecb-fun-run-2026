'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createAdminAction, CreateAdminResult } from '@/lib/actions/adminUsers';
import { inputBaseClass } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ADMIN_ROLES, ADMIN_ROLE_LABEL } from '@/lib/config';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'กำลังสร้าง...' : 'สร้างบัญชี'}
    </Button>
  );
}

const initialState: CreateAdminResult = { ok: false };

export function CreateAdminForm() {
  const [state, formAction] = useFormState(createAdminAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <Card className="space-y-4">
      <h2 className="font-bold text-ink">เพิ่มบัญชีแอดมิน</h2>
      <form ref={formRef} action={formAction} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-600">ชื่อ</span>
            <input name="name" type="text" required className={inputBaseClass()} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-600">อีเมล</span>
            <input name="email" type="email" required className={inputBaseClass()} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-600">รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)</span>
            <input name="password" type="password" required minLength={8} className={inputBaseClass()} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-600">สิทธิ์การใช้งาน</span>
            <select name="role" required defaultValue="REGISTRATION_STAFF" className={inputBaseClass()}>
              {ADMIN_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ADMIN_ROLE_LABEL[role]}
                </option>
              ))}
            </select>
          </label>
        </div>
        {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
        {state?.ok && <p className="text-sm font-medium text-teal-600">สร้างบัญชีเรียบร้อยแล้ว</p>}
        <SubmitButton />
      </form>
    </Card>
  );
}
