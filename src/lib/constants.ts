import type { ExhibitorStatus } from '@/types/database';

export const APP_DOMAIN = 'approssodisera.lucidimezzo.it';

export const EXHIBITOR_STATUSES: { value: ExhibitorStatus; label: string }[] = [
  { value: 'bozza', label: 'Bozza' },
  { value: 'candidatura_ricevuta', label: 'Candidatura ricevuta' },
  { value: 'in_valutazione', label: 'In valutazione' },
  { value: 'accettato', label: 'Accettato' },
  { value: 'in_attesa_pagamento', label: 'In attesa pagamento' },
  { value: 'confermato', label: 'Confermato' },
  { value: 'rifiutato', label: 'Rifiutato' },
  { value: 'rinunciato', label: 'Rinunciato' },
];

export const EXPERIENCE_OPTIONS = [
  'Degustazioni',
  'Visite in cantina',
  'Wine tour',
  'Pranzi / cene in azienda',
  'Shop aziendale',
  'Altro',
];
