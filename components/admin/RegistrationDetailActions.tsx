'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  verifyPaymentAction,
  paymentIssueAction,
  paymentReminderAction,
  approveRegistrationAction,
  rejectRegistrationAction,
} from '@/lib/actions/adminRegistrations';
import { PaymentStatus, RegistrationStatus } from '@/lib/config';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export function RegistrationDetailActions({
  participantId,
  registrationStatus,
  paymentStatus,
  canVerify,
}: {
  participantId: string;
  registrationStatus: RegistrationStatus;
  paymentStatus: PaymentStatus;
  canVerify: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<null | 'issue' | 'reject' | 'approve'>(null);
  const [reason, setReason] = useState('');

  const isTerminal = ['APPROVED', 'REJECTED', 'CANCELLED'].includes(registrationStatus);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (!res.ok) setError(res.error ?? 'เกิดข้อผิดพลาด');
      else {
        setModal(null);
        setReason('');
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={!canVerify || isPending || paymentStatus === 'VERIFIED'}
          onClick={() => run(() => verifyPaymentAction(participantId))}
        >
          Verify Payment
        </Button>
        <Button size="sm" variant="outline" disabled={isPending || isTerminal} onClick={() => setModal('issue')}>
          Payment Issue
        </Button>
        <Button size="sm" variant="outline" disabled={isPending || isTerminal} onClick={() => run(() => paymentReminderAction(participantId))}>
          Send Payment Reminder
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        <Button size="sm" disabled={isPending || isTerminal} onClick={() => setModal('approve')}>
          Approve Registration
        </Button>
        <Button size="sm" variant="danger" disabled={isPending || isTerminal} onClick={() => setModal('reject')}>
          Reject Registration
        </Button>
      </div>

      <Modal open={modal === 'approve'} onClose={() => setModal(null)} title="ยืนยันการอนุมัติ">
        <p className="text-sm text-gray-600 mb-4">
          ระบบจะสร้าง QR Code และส่ง Confirmation Email ให้ผู้สมัครทันที
          {paymentStatus !== 'VERIFIED' && (
            <span className="block mt-2 text-amber-600 font-medium">
              คำเตือน: ยังไม่ได้ Verify Payment สำหรับผู้สมัครรายนี้
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" fullWidth onClick={() => setModal(null)}>
            ยกเลิก
          </Button>
          <Button fullWidth disabled={isPending} onClick={() => run(() => approveRegistrationAction(participantId))}>
            ยืนยัน Approve
          </Button>
        </div>
      </Modal>

      <Modal open={modal === 'issue'} onClose={() => setModal(null)} title="Payment Issue">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="ระบุเหตุผล เช่น ยอดเงินไม่ตรง, Slip อ่านไม่ได้"
          className="w-full h-24 rounded-xl border-2 border-gray-200 p-3 text-sm focus:outline-none focus:border-brand-400"
        />
        <div className="flex gap-2 mt-3">
          <Button variant="outline" fullWidth onClick={() => setModal(null)}>
            ยกเลิก
          </Button>
          <Button variant="danger" fullWidth disabled={isPending} onClick={() => run(() => paymentIssueAction(participantId, reason))}>
            ส่งแจ้งปัญหา
          </Button>
        </div>
      </Modal>

      <Modal open={modal === 'reject'} onClose={() => setModal(null)} title="Reject Registration">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="ระบุเหตุผลการปฏิเสธ"
          className="w-full h-24 rounded-xl border-2 border-gray-200 p-3 text-sm focus:outline-none focus:border-brand-400"
        />
        <div className="flex gap-2 mt-3">
          <Button variant="outline" fullWidth onClick={() => setModal(null)}>
            ยกเลิก
          </Button>
          <Button variant="danger" fullWidth disabled={isPending} onClick={() => run(() => rejectRegistrationAction(participantId, reason))}>
            ยืนยัน Reject
          </Button>
        </div>
      </Modal>
    </div>
  );
}
