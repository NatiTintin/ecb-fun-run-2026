import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTHB(amount: number) {
  return `${amount.toLocaleString('th-TH')} บาท`;
}

export function formatThaiDate(date: Date) {
  return new Intl.DateTimeFormat('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Bangkok',
  }).format(date);
}

/**
 * datetime-local inputs have no timezone concept — they just show/parse
 * "wall clock" numbers. Event dates are always meant as Bangkok time, so we
 * convert explicitly rather than relying on the admin's browser timezone
 * (which would silently shift the value for anyone not in Asia/Bangkok).
 */
export function toBangkokInputValue(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

export function fromBangkokInputValue(value: string): Date {
  return new Date(`${value}:00+07:00`);
}

/** Extracts the opaque token from a scanned QR URL, tolerating a bare token too. */
export function extractTokenFromScan(scanned: string): string {
  try {
    const url = new URL(scanned);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? scanned;
  } catch {
    return scanned.trim();
  }
}

export function formatThaiDateTime(date: Date) {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  }).format(date);
}
