'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ALLOWED_SLIP_MIME_TYPES, MAX_SLIP_SIZE_BYTES } from '@/lib/config';
import { uploadSlipAction } from '@/lib/actions/publicRegistration';
import { Button } from '@/components/ui/Button';

export function SlipUploadForm({ token }: { token: string }) {
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
      setError('รองรับเฉพาะไฟล์ JPG, PNG หรือ PDF เท่านั้น');
      return;
    }
    if (f.size > MAX_SLIP_SIZE_BYTES) {
      setError('ขนาดไฟล์ต้องไม่เกิน 8 MB');
      return;
    }
    setFile(f);
  }

  function submit() {
    if (!file) {
      setError('กรุณาเลือกไฟล์หลักฐานการชำระเงิน');
      return;
    }
    const fd = new FormData();
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
      {success && <p className="text-xs font-medium text-teal-600">อัปโหลดสำเร็จ ขอบคุณค่ะ/ครับ</p>}
      <Button fullWidth onClick={submit} disabled={isPending || !file}>
        {isPending ? 'กำลังอัปโหลด...' : 'อัปโหลดหลักฐานการชำระเงิน'}
      </Button>
    </div>
  );
}
