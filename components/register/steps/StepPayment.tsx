'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { ALLOWED_SLIP_MIME_TYPES, MAX_SLIP_SIZE_BYTES, Distance, ParticipantType } from '@/lib/config';
import { formatTHB } from '@/lib/utils';
import { RegistrationDraft, PaymentInfo, PricingInfo, priceFor } from '@/components/register/types';
import { Card } from '@/components/ui/Card';

export function StepPayment({
  draft,
  update,
  errors,
  payment,
  pricing,
}: {
  draft: RegistrationDraft;
  update: (patch: Partial<RegistrationDraft>) => void;
  errors: Record<string, string>;
  payment: PaymentInfo;
  pricing: PricingInfo;
}) {
  const { dict } = useLanguage();
  const t = dict.register.payment;
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const fee =
    draft.distance && draft.participantType
      ? priceFor(pricing, draft.distance as Distance, draft.participantType as ParticipantType)
      : 0;

  useEffect(() => {
    if (draft.slip && draft.slip.type.startsWith('image/')) {
      const url = URL.createObjectURL(draft.slip);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [draft.slip]);

  function onFileChange(file: File | null) {
    setFileError(null);
    if (!file) {
      update({ slip: null });
      return;
    }
    if (!ALLOWED_SLIP_MIME_TYPES.includes(file.type)) {
      setFileError(t.slipTypeError);
      return;
    }
    if (file.size > MAX_SLIP_SIZE_BYTES) {
      setFileError(t.slipSizeError);
      return;
    }
    update({ slip: file });
  }

  const hasBankInfo = payment.bankAccountNumber || payment.promptPayNumber;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-ink">{t.heading}</h2>
        <p className="text-sm text-gray-500">{t.subheading}</p>
      </div>

      <Card className="bg-brand-50 border-brand-200">
        <p className="text-sm text-gray-600">{t.registrationFee}</p>
        <p className="text-3xl font-extrabold text-brand-600">{formatTHB(fee)}</p>
      </Card>

      <Card className="space-y-2">
        <h3 className="font-bold text-ink">{t.bankInfo}</h3>
        {hasBankInfo ? (
          <div className="text-sm space-y-1 text-gray-700">
            {payment.bankName && (
              <p>
                {t.bank}: {payment.bankName}
              </p>
            )}
            {payment.bankAccountName && (
              <p>
                {t.accountName}: {payment.bankAccountName}
              </p>
            )}
            {payment.bankAccountNumber && (
              <p>
                {t.accountNumber}: {payment.bankAccountNumber}
              </p>
            )}
            {payment.promptPayNumber && <p>PromptPay: {payment.promptPayNumber}</p>}
            {payment.promptPayQrImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={payment.promptPayQrImageUrl}
                alt="PromptPay QR"
                className="w-40 h-40 rounded-xl border border-gray-200 mt-2"
              />
            )}
            {payment.paymentInstructions && (
              <p className="pt-2 text-gray-500 whitespace-pre-line">{payment.paymentInstructions}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t.noBankInfo}</p>
        )}
      </Card>

      <Card className="space-y-3">
        <h3 className="font-bold text-ink">{t.slipHeading}</h3>
        <p className="text-xs text-gray-500">{t.slipHint}</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg,application/pdf"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-600 file:mr-3 file:h-11 file:rounded-xl file:border-0 file:bg-brand-500 file:text-white file:px-4 file:font-semibold"
        />
        {fileError && <p className="text-xs font-medium text-red-600">{fileError}</p>}
        {errors.slip && <p className="text-xs font-medium text-red-600">{errors.slip}</p>}
        {draft.slip && (
          <div className="rounded-xl border border-gray-200 p-3 flex items-center gap-3">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Slip preview" className="w-16 h-16 object-cover rounded-lg" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-red-50 flex items-center justify-center text-xs font-bold text-red-500">
                PDF
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{draft.slip.name}</p>
              <p className="text-xs text-gray-500">
                {(draft.slip.size / 1024).toFixed(0)} KB · {t.slipReady}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
