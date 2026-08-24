'use client';

import { Button } from '@/components/ui/Button';

export function SaveQrButton({ dataUrl, filename }: { dataUrl: string; filename: string }) {
  function save() {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }

  return (
    <Button variant="secondary" fullWidth onClick={save}>
      Save QR Code
    </Button>
  );
}
