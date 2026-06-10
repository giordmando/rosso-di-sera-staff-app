export function normalizeText(value: string | null | undefined) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export function normalizeRegion(value: string | null | undefined) {
  const raw = normalizeText(value);
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower === 'marche') return 'Marche';
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

const provinceMap: Record<string, string> = {
  an: 'AN', ancona: 'AN',
  ap: 'AP', 'ascoli piceno': 'AP',
  fm: 'FM', fermo: 'FM',
  mc: 'MC', macerata: 'MC',
  pu: 'PU', pesaro: 'PU', 'pesaro urbino': 'PU', 'pesaro e urbino': 'PU',
};

export function normalizeProvince(value: string | null | undefined) {
  const raw = normalizeText(value);
  if (!raw) return null;
  const key = raw.toLowerCase().replace('provincia di ', '').trim();
  return provinceMap[key] ?? raw.toUpperCase();
}
