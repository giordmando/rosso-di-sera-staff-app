'use client';

import { useActionState } from 'react';
import { submitCandidature, type CandidatureState } from '@/lib/actions/candidature';
import { EXPERIENCE_OPTIONS } from '@/lib/constants';

const initialState: CandidatureState = { ok: false, message: '' };

export function CandidatureForm() {
  const [state, formAction, pending] = useActionState(submitCandidature, initialState);

  return (
    <form action={formAction} style={{ display: 'grid', gap: 18, marginTop: 28 }}>
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
      <label><input type="checkbox" name="media_consent" /> Autorizzo l'utilizzo di immagini e contenuti aziendali per finalità promozionali.</label>
      <button className="btn btn-primary" disabled={pending} type="submit">{pending ? 'Invio in corso...' : 'Invia candidatura'}</button>
      {state.message ? <p style={{ color: state.ok ? 'green' : 'var(--wine)', fontWeight: 700 }}>{state.message}</p> : null}
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
