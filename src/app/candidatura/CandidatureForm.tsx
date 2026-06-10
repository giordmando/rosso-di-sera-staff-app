'use client';

import { useState } from 'react';
import { EXPERIENCE_OPTIONS } from '@/lib/constants';

const MARCHE_PROVINCES = ['AN', 'AP', 'FM', 'MC', 'PU'];
const MARCHE_COMMONS = ['Ancona', 'Ascoli Piceno', 'Fermo', 'Macerata', 'Pesaro', 'Senigallia', 'Jesi', 'Fano', 'Civitanova Marche', 'San Benedetto del Tronto'];

export function CandidatureForm() {
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    const body = { company_name: String(form.get('company_name') || ''), brand_name: String(form.get('brand_name') || ''), contact_name: String(form.get('contact_name') || ''), email: String(form.get('email') || ''), phone: String(form.get('phone') || ''), website_social: String(form.get('website_social') || ''), city: String(form.get('city') || ''), province: String(form.get('province') || ''), region: String(form.get('region') || ''), products: String(form.get('products') || ''), company_story: String(form.get('company_story') || ''), experiences: form.getAll('experiences').map(String), media_consent: form.get('media_consent') === 'on' };
    const response = await fetch('/api/candidature', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    setPending(false);
    setOk(response.ok);
    setMessage(result.message || (response.ok ? 'Candidatura inviata' : 'Errore invio candidatura'));
    if (response.ok) event.currentTarget.reset();
  }
  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18, marginTop: 28 }}>
      <div className="form-grid"><label><span>Ragione sociale</span><input name="company_name" /></label><label><span>Nome azienda / cantina</span><input name="brand_name" required /></label></div>
      <div className="form-grid"><label><span>Referente</span><input name="contact_name" /></label><label><span>Email</span><input name="email" type="email" /></label></div>
      <div className="form-grid"><label><span>Telefono</span><input name="phone" /></label><label><span>Sito web / Social</span><input name="website_social" /></label></div>
      <div className="grid grid-3"><label><span>Comune</span><select name="city" defaultValue=""><option value="">Seleziona comune</option>{MARCHE_COMMONS.map((item) => <option key={item} value={item}>{item}</option>)}<option value="Altro">Altro / fuori lista</option></select></label><label><span>Provincia</span><select name="province" defaultValue=""><option value="">Seleziona provincia</option>{MARCHE_PROVINCES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label><span>Regione</span><select name="region" defaultValue="Marche"><option value="Marche">Marche</option><option value="Abruzzo">Abruzzo</option><option value="Emilia-Romagna">Emilia-Romagna</option><option value="Umbria">Umbria</option><option value="Altro">Altro</option></select></label></div>
      <label><span>Prodotti presentati</span><textarea name="products" rows={5} /></label>
      <label><span>Racconta la tua azienda</span><textarea name="company_story" rows={5} /></label>
      <fieldset className="card" style={{ boxShadow: 'none' }}><legend className="eyebrow">Esperienze offerte</legend><div className="grid grid-2">{EXPERIENCE_OPTIONS.map((item) => <label key={item} style={{ fontWeight: 400 }}><input type="checkbox" name="experiences" value={item} style={{ width: 'auto', marginRight: 8 }} />{item}</label>)}</div></fieldset>
      <label style={{ fontWeight: 400 }}><input type="checkbox" name="media_consent" style={{ width: 'auto', marginRight: 8 }} />Autorizzo l'utilizzo di immagini e contenuti aziendali per finalita promozionali.</label>
      <button className="btn btn-primary" disabled={pending} type="submit">{pending ? 'Invio in corso...' : 'Invia candidatura'}</button>
      {message ? <p style={{ color: ok ? 'green' : 'var(--wine)', fontWeight: 700 }}>{message}</p> : null}
    </form>
  );
}
