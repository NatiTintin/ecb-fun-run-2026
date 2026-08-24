'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { Button } from '@/components/ui/Button';

export function SaveQrButton({ dataUrl, filename }: { dataUrl: string; filename: string }) {
  const { dict } = useLanguage();

  function save() {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }

  return (
    <Button variant="secondary" fullWidth onClick={save}>
      {dict.status.saveQr}
    </Button>
  );
}
