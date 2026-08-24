'use client';

import { useEffect, useState, useTransition } from 'react';
import { lookupQrTokenAction, confirmBibCollectionAction, CheckinLookupResult } from '@/lib/actions/adminCheckin';
import { extractTokenFromScan, formatThaiDateTime } from '@/lib/utils';
import { QrScanner } from '@/components/admin/QrScanner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

type Result = (CheckinLookupResult & { token: string }) | null;

export function CheckinPanel({ initialToken }: { initialToken?: string }) {
  const [scanning, setScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [result, setResult] = useState<Result>(null);
  const [confirmMessage, setConfirmMessage] = useState<{ tone: 'success' | 'warning'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialToken) lookup(initialToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  function handleScan(raw: string) {
    const token = extractTokenFromScan(raw);
    setScanning(false);
    lookup(token);
  }

  function lookup(token: string) {
    setConfirmMessage(null);
    startTransition(async () => {
      const res = await lookupQrTokenAction(token);
      setResult({ ...res, token });
    });
  }

  function confirm() {
    if (!result?.ok) return;
    startTransition(async () => {
      const res = await confirmBibCollectionAction(result.token);
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
    setManualToken('');
  }

  return (
    <div className="max-w-md mx-auto p-5 space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-ink">BIB Check-in</h1>
        <p className="text-sm text-gray-500">Event Day Mode</p>
      </div>

      {!result && !scanning && (
        <div className="space-y-4">
          <Button size="lg" fullWidth onClick={() => setScanning(true)} className="h-20 text-xl">
            📷 SCAN QR CODE
          </Button>
          <div className="flex gap-2">
            <input
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="หรือกรอก Token ด้วยตนเอง"
              className="flex-1 h-12 rounded-xl border-2 border-gray-200 px-3 text-sm focus:outline-none focus:border-brand-400"
            />
            <Button variant="outline" disabled={!manualToken || isPending} onClick={() => lookup(manualToken.trim())}>
              ค้นหา
            </Button>
          </div>
        </div>
      )}

      {scanning && (
        <div className="space-y-3">
          <QrScanner active={scanning} onScan={handleScan} />
          <Button variant="outline" fullWidth onClick={() => setScanning(false)}>
            ยกเลิกการสแกน
          </Button>
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
                <Button size="lg" fullWidth disabled={isPending} onClick={confirm}>
                  CONFIRM BIB COLLECTION
                </Button>
              ) : (
                <p className="text-sm text-red-600">การสมัครนี้ยังไม่ได้รับการอนุมัติ ไม่สามารถรับ BIB ได้</p>
              )}
            </>
          ) : (
            <p className="text-red-600 font-semibold">{result.error}</p>
          )}
          <Button variant="ghost" fullWidth onClick={reset}>
            สแกนคนถัดไป
          </Button>
        </Card>
      )}
    </div>
  );
}
