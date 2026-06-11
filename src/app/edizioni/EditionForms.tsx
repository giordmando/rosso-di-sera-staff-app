import { createEdition, updateEdition } from '@/lib/actions/editions';

type Edition = {
  id: string;
  year: number;
  name: string;
  location: string;
  max_exhibitors: number;
  exhibitor_fee: number;
  google_spreadsheet_id: string | null;
  is_active: boolean;
};

export function NewEditionForm() {
  return (
    <section className="card" style={{ marginBottom: 24 }}>
      <h2>Nuova edizione</h2>
      <form action={createEdition} className="form-grid">
        <label><span>Anno</span><input name="year" type="number" required /></label>
        <label><span>Nome</span><input name="name" placeholder="Rosso di Sera 2027" /></label>
        <label><span>Location</span><input name="location" defaultValue="Villa Bonaparte, Porto San Giorgio" /></label>
        <label><span>Posti max</span><input name="max_exhibitors" type="number" defaultValue={45} /></label>
        <label><span>Quota</span><input name="exhibitor_fee" type="number" step="0.01" defaultValue={183} /></label>
        <label><span>Foglio Google</span><input name="google_spreadsheet_id" /></label>
        <label style={{ fontWeight: 400 }}><input type="checkbox" name="is_active" style={{ width: 'auto', marginRight: 8 }} />Rendi attiva</label>
        <div><button className="btn btn-primary" type="submit">Crea edizione</button></div>
      </form>
    </section>
  );
}

export function EditionCard({ edition }: { edition: Edition }) {
  return (
    <form action={updateEdition} className="card">
      <input type="hidden" name="id" value={edition.id} />
      <div className="page-header" style={{ marginBottom: 18 }}>
        <div><p className="eyebrow">{edition.year}</p><h2 style={{ margin: 0 }}>{edition.name}</h2>{edition.is_active ? <span className="badge" style={{ marginTop: 10 }}>Attiva</span> : null}</div>
        <button className="btn btn-secondary" type="submit">Salva</button>
      </div>
      <div className="form-grid">
        <label><span>Nome</span><input name="name" defaultValue={edition.name} /></label>
        <label><span>Location</span><input name="location" defaultValue={edition.location} /></label>
        <label><span>Posti max</span><input name="max_exhibitors" type="number" defaultValue={edition.max_exhibitors} /></label>
        <label><span>Quota</span><input name="exhibitor_fee" type="number" step="0.01" defaultValue={edition.exhibitor_fee} /></label>
        <label><span>Foglio Google</span><input name="google_spreadsheet_id" defaultValue={edition.google_spreadsheet_id ?? ''} /></label>
        <label style={{ fontWeight: 400 }}><input type="checkbox" name="is_active" defaultChecked={edition.is_active} style={{ width: 'auto', marginRight: 8 }} />Edizione attiva</label>
      </div>
    </form>
  );
}
