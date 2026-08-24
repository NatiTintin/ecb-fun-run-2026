import { db } from '@/lib/db';

export async function getEventSettings() {
  const settings = await db.eventSettings.findUnique({ where: { id: 'singleton' } });
  if (!settings) {
    throw new Error('EventSettings singleton row is missing — run `npm run db:seed`.');
  }
  return settings;
}

export type RegistrationWindowState = 'UPCOMING' | 'OPEN' | 'CLOSED';

export function computeRegistrationWindowState(
  settings: { registrationOpenAt: Date; registrationCloseAt: Date; registrationOverride: string },
  now: Date = new Date()
): RegistrationWindowState {
  if (settings.registrationOverride === 'FORCE_OPEN') return 'OPEN';
  if (settings.registrationOverride === 'FORCE_CLOSED') return 'CLOSED';

  if (now < settings.registrationOpenAt) return 'UPCOMING';
  if (now > settings.registrationCloseAt) return 'CLOSED';
  return 'OPEN';
}

export function priceFor(
  settings: {
    price5kmAdult: number;
    price5kmChild: number;
    price3kmAdult: number;
    price3kmChild: number;
  },
  distance: 'KM3' | 'KM5',
  participantType: 'ADULT' | 'CHILD'
): number {
  if (distance === 'KM5') return participantType === 'ADULT' ? settings.price5kmAdult : settings.price5kmChild;
  return participantType === 'ADULT' ? settings.price3kmAdult : settings.price3kmChild;
}
