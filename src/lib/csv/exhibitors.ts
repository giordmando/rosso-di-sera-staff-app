import { normalizeProvince, normalizeRegion } from '@/lib/geo/normalize';

export type CsvExhibitor = Record<string, string>;

export function parseCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return [];
  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(separator).map((item) => item.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(separator).map((item) => item.trim().replace(/^"|"$/g, ''));
    const row: CsvExhibitor = {};
    headers.forEach((header, index) => { row[header] = values[index] ?? ''; });
    return row;
  });
}

export function csvPayload(row: CsvExhibitor) {
  return {
    brand_name: row.ID ? row.Cantina || 'Senza nome' : row.Cantina || row.brand_name || 'Senza nome',
    company_name: row['Ragione sociale'] || row.company_name || null,
    contact_name: row.Referente || row.contact_name || null,
    email: row.Email || row.email || null,
    phone: row.Telefono || row.phone || null,
    city: row.Comune || row.city || null,
    province: normalizeProvince(row.Provincia || row.province),
    region: normalizeRegion(row.Regione || row.region),
    status: row.Stato || row.status || 'candidatura_ricevuta',
    products: row.Prodotti || row.products || null,
    internal_notes: row['Note interne'] || row.internal_notes || null,
    updated_at: new Date().toISOString(),
  };
}
