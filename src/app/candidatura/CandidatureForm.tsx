'use client';

import { useState } from 'react';
import { EXPERIENCE_OPTIONS } from '@/lib/constants';

export function CandidatureForm() {
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const body = {
      company_name: String(form.get('company_name') || ''),
      brand_name: String(form.get('brand_name') || ''),
      contact_name: String(form.get('contact_name') || ''),
      email: String(form.get('email') || ''),
      phone: String(form.get('phone') || ''),
      website_social: String(form.get('website_social') || ''),
      city: String(form.get('city') || ''),
      province: String(form.get('province') || ''),
      region: String(form.get('region') || ''),
      products: String(form.get('products') || ''),
      company_story: String(form.get('company_story') || ''),
      experiences: form.getAll('experiences').map(String),
      media_consent: form.get('media_consent') === 'on',
    };

    const response = await fetch('/api/candidature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    setPending(false);
    setOk(response.ok);
    setMessage(result.message || (response.ok ? 'Candidatura inviata' : 'Errore invio candidatura'));

    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18, marginTop: 28 }}>
      <div className="grid grid-2">
        <label>Ragione sociale<input name="company_name" style={inputStyle} /></label>
        <label>Nome azienda / cantina<input name="brand_name" required style={inputStyle} /></label>
      </div>
      <div className="grid grid-2">
        <label>Referente<input name="contact_name" style={inputStyle} /></label>
        <label>Email<input name="email" type="email" style={inputStyle} /></label>
      </div>
      <div className="grid grid-2">
        <label>Telefono<input name="phone" style={inputStyle} /></label>
        <label>Sito web / Social<input name="website_social" style={inputStyle} /></label>
      </div>
      <div className="grid grid-3">
        <label>Comune<input name="city" style={inputStyle} /></label>
        <label>Provincia<input name="province" style={inputStyle} /></label>
        <label>Regione<input name="region" defaultValue="Marche" style={inputStyle} /></label>
      </div>
      <label>Prodotti presentati<textarea name="products" rows={5} style={inputStyle} /></label>
      <label>Racconta la tua azienda<textarea name="company_story" rows={5} style={inputStyle} /></label>
      <fieldset style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
        <legend>Esperienze offerte</legend>
        <div className="grid grid-2">
          {EXPERIENCE_OPTIONS.map((item) => <label key={item}><input type="checkbox" name="experiences" value={item} /> {item}</label>)}
        </div>
      </fieldset>
      <label><input type="checkbox" name="media_consent" /> Autorizzo l'utilizzo di immagini e contenuti aziendali per finalita promozionali.</label>
      <button className="btn btn-primary" disabled={pending} type="submit">{pending ? 'Invio in corso...' : 'Invia candidatura'}</button>
      {message ? <p style={{ color: ok ? 'green' : 'var(--wine)', fontWeight: 700 }}>{message}</p> : null}
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 8,
  padding: 12,
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'white',
};
