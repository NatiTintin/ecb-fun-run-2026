'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ALLOWED_SLIP_MIME_TYPES, MAX_SLIP_SIZE_BYTES } from '@/lib/config';
import { uploadSlipAction } from '@/lib/actions/publicRegistration';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { Button } from '@/components/ui/Button';

export function SlipUploadForm({ token }: { token: string }) {
  const { dict, locale } = useLanguage();
  const t = dict.status;
  const p = dict.register.payment;
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function onFileChange(f: File | null) {
    setError(null);
    if (!f) return setFile(null);
    if (!ALLOWED_SLIP_MIME_TYPES.includes(f.type)) {
      setError(p.slipTypeError);
      return;
    }
    if (f.size > MAX_SLIP_SIZE_BYTES) {
      setError(p.slipSizeError);
      return;
    }
    setFile(f);
  }

  function submit() {
    if (!file) {
      setError(t.chooseFileError);
      return;
    }
    const fd = new FormData();
    fd.set('locale', locale);
    fd.set('slip', file);
    startTransition(async () => {
      const res = await uploadSlipAction(token, fd);
      if (res.ok) {
        setSuccess(true);
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,application/pdf"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-gray-600 file:mr-3 file:h-11 file:rounded-xl file:border-0 file:bg-brand-500 file:text-white file:px-4 file:font-semibold"
      />
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      {success && <p className="text-xs font-medium text-teal-600">{t.uploadSuccess}</p>}
      <Button fullWidth onClick={submit} disabled={isPending || !file}>
        {isPending ? t.uploading : t.uploadButton}
      </Button>
    </div>
  );
}
