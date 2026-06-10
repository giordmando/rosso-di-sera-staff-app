import { EXPERIENCE_OPTIONS } from '@/lib/constants';

export default function CandidaturePage() {
  return (
    <main>
      <section style={{ padding: '56px 0' }}>
        <div className="container">
          <div className="card" style={{ maxWidth: 920, margin: '0 auto' }}>
            <p style={{ color: 'var(--wine)', fontWeight: 800 }}>ROSSO DI SERA 2026</p>
            <h1>Candidatura espositore</h1>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
              Compila il modulo per proporre la tua azienda. La candidatura sarà valutata dallo staff. I posti disponibili sono limitati.
            </p>
            <form style={{ display: 'grid', gap: 18, marginTop: 28 }}>
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
              <label>Tipologia espositore<select name="type" style={inputStyle}><option>Cantina vitivinicola</option><option>Azienda agricola Olio EVO</option><option>Pasticceria</option><option>Gastronomia</option><option>Altro</option></select></label>
              <label>Prodotti presentati<textarea name="products" rows={5} style={inputStyle} /></label>
              <label>Racconta la tua azienda<textarea name="company_story" rows={5} style={inputStyle} /></label>
              <fieldset style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
                <legend>Esperienze offerte</legend>
                <div className="grid grid-2">
                  {EXPERIENCE_OPTIONS.map((item) => <label key={item}><input type="checkbox" name="experiences" value={item} /> {item}</label>)}
                </div>
              </fieldset>
              <label><input type="checkbox" name="media_consent" /> Autorizzo l'utilizzo di immagini e contenuti aziendali per finalità promozionali legate all'evento.</label>
              <button className="btn btn-primary" type="button">Invia candidatura</button>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Il salvataggio sarà collegato a Supabase nella prossima milestone.</p>
            </form>
          </div>
        </div>
      </section>
    </main>
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
