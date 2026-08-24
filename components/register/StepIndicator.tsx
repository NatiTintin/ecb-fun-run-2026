import { cn } from '@/lib/utils';

const STEP_LABELS = ['Details', 'Race', 'Shirt', 'Health & Consent', 'Payment', 'Review'];

export function StepIndicator({ step }: { step: number }) {
  return (
    <div className="sticky top-0 z-10 bg-cream/95 backdrop-blur border-b border-gray-100 px-4 py-3">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1.5">
          <span>
            ขั้นตอนที่ {step} จาก {STEP_LABELS.length}
          </span>
          <span className="text-brand-600">{STEP_LABELS[step - 1]}</span>
        </div>
        <div className="flex gap-1.5">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors',
                i + 1 <= step ? 'bg-brand-500' : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
