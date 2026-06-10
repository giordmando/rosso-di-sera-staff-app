import Link from 'next/link';
import { AppFooter } from '@/components/AppFooter';
import { CandidatureForm } from './CandidatureForm';

export default function CandidaturePage() {
  return <><main><section className="container page"><div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 24 }}><Link href="/dashboard" className="btn btn-secondary">Torna alla dashboard</Link><Link href="/espositori" className="btn btn-secondary">Elenco espositori</Link></div><div className="card" style={{ maxWidth: 920, margin: '0 auto' }}><p className="eyebrow">Rosso di Sera 2026</p><h1 className="page-title">Candidatura espositore</h1><p className="muted">Compila il modulo per proporre la tua azienda. La candidatura sarà valutata dallo staff. I posti disponibili sono limitati.</p><CandidatureForm /></div></section></main><AppFooter /></>;
}
