'use client';

import { useRef, useState, useTransition } from 'react';
import { lookupByIdNumberAction, confirmBibCollectionAction, CheckinLookupResult } from '@/lib/actions/adminCheckin';
import { formatThaiDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SignaturePad, SignaturePadHandle } from '@/components/admin/SignaturePad';

type Result = CheckinLookupResult | null;

export function CheckinPanel() {
  const [idNumber, setIdNumber] = useState('');
  const [result, setResult] = useState<Result>(null);
  const [confirmMessage, setConfirmMessage] = useState<{ tone: 'success' | 'warning'; text: string } | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isPending, startTransition] = useTransition();
  const signaturePadRef = useRef<SignaturePadHandle>(null);

  function lookup() {
    if (!idNumber.trim()) return;
    setConfirmMessage(null);
    startTransition(async () => {
      const res = await lookupByIdNumberAction(idNumber.trim());
      setResult(res);
    });
  }

  function confirm() {
    if (!result?.ok) return;
    const signatureData = signaturePadRef.current?.getDataUrl();
    if (!signatureData) {
      setConfirmMessage({ tone: 'warning', text: 'กรุณาให้ผู้รับ BIB เซ็นชื่อก่อนยืนยัน' });
      return;
    }
    startTransition(async () => {
      const res = await confirmBibCollectionAction(result.participantId, signatureData);
      if (res.ok) {
        setConfirmMessage(
          res.alreadyCollected
            ? { tone: 'warning', text: `BIB Already Collected (เดิม: ${formatThaiDateTime(new Date(res.collectedAt))})` }
            : { tone: 'success', text: 'BIB COLLECTED ✓' }
        );
        setResult((r) => (r?.ok ? { ...r, alreadyCollected: true, collectedAt: res.collectedAt } : r));
      } else {
        setConfirmMessage({ tone: 'warning', text: res.error });
      }
    });
  }

  function reset() {
    setResult(null);
    setConfirmMessage(null);
    setIdNumber('');
    setHasSignature(false);
    signaturePadRef.current?.clear();
  }

  return (
    <div className="max-w-md mx-auto p-5 space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-ink">BIB Check-in</h1>
        <p className="text-sm text-gray-500">Event Day Mode</p>
      </div>

      {!result && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 text-center">
            ขอดูบัตรประชาชน/พาสปอร์ตของผู้สมัคร แล้วกรอกเลขที่นี่
          </p>
          <div className="flex gap-2">
            <input
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookup()}
              placeholder="เลขบัตรประชาชน / Passport"
              autoFocus
              className="flex-1 h-14 rounded-xl border-2 border-gray-200 px-4 text-lg focus:outline-none focus:border-brand-400"
            />
            <Button size="lg" disabled={!idNumber.trim() || isPending} onClick={lookup}>
              ค้นหา
            </Button>
          </div>
        </div>
      )}

      {isPending && !result && <p className="text-center text-gray-400">กำลังค้นหา...</p>}

      {result && (
        <Card className="space-y-3 text-center">
          {result.ok ? (
            <>
              <p className="text-2xl font-extrabold text-ink">{result.fullName}</p>
              <p className="text-gray-500">{result.registrationId}</p>
              <p className="text-lg font-bold text-brand-600">
                {result.distanceLabel} / {result.participantTypeLabel.split(' /')[0]}
              </p>
              <p className="text-gray-600">Shirt Size {result.shirtSize}</p>
              <Badge tone={result.isApproved ? 'success' : 'danger'}>{result.registrationStatusLabel}</Badge>

              {result.isApproved && result.bibNumber != null && (
                <div className="rounded-2xl bg-brand-50 border-2 border-brand-300 py-4">
                  <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">BIB Number</p>
                  <p className="text-5xl font-extrabold text-brand-700">{result.bibNumber}</p>
                </div>
              )}

              {confirmMessage ? (
                <div
                  className={`rounded-xl p-4 font-bold text-lg ${
                    confirmMessage.tone === 'success' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {confirmMessage.text}
                </div>
              ) : result.alreadyCollected ? (
                <div className="rounded-xl bg-amber-50 text-amber-700 p-4 font-bold">
                  BIB Already Collected
                  {result.collectedAt && (
                    <p className="text-sm font-normal mt-1">{formatThaiDateTime(new Date(result.collectedAt))}</p>
                  )}
                </div>
              ) : result.isApproved ? (
                <div className="space-y-3 text-left">
                  <p className="text-sm font-semibold text-ink text-center">กรุณาให้ผู้รับ BIB เซ็นชื่อ</p>
                  <SignaturePad ref={signaturePadRef} onChange={setHasSignature} />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        signaturePadRef.current?.clear();
                        setHasSignature(false);
                      }}
                    >
                      ล้างลายเซ็น
                    </Button>
                    <Button size="lg" fullWidth disabled={isPending || !hasSignature} onClick={confirm}>
                      CONFIRM BIB COLLECTION
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-600">การสมัครนี้ยังไม่ได้รับการอนุมัติ ไม่สามารถรับ BIB ได้</p>
              )}
            </>
          ) : (
            <p className="text-red-600 font-semibold">{result.error}</p>
          )}
          <Button variant="ghost" fullWidth onClick={reset}>
            ค้นหาคนถัดไป
          </Button>
        </Card>
      )}
    </div>
  );
}
