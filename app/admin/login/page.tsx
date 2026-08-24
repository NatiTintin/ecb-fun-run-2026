'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction } from '@/lib/actions/adminAuth';
import { Field, inputBaseClass } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
    </Button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAction, {});

  return (
    <main className="min-h-screen flex items-center justify-center px-5 bg-gradient-to-br from-brand-500 via-brand-400 to-sunshine-400">
      <Card className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-brand-500 font-bold">ECB Fun Run 2026</p>
          <h1 className="text-xl font-extrabold text-ink mt-1">Admin Login</h1>
        </div>
        <form action={formAction} className="space-y-4">
          <Field label="Email" htmlFor="email" required>
            <input id="email" name="email" type="email" required className={inputBaseClass()} autoComplete="email" />
          </Field>
          <Field label="Password" htmlFor="password" required>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={inputBaseClass()}
              autoComplete="current-password"
            />
          </Field>
          {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
          <SubmitButton />
        </form>
      </Card>
    </main>
  );
}
