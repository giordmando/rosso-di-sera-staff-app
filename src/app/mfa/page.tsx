'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Factor = { id: string; status: string; factor_type: string };

export default function MfaPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [factorId, setFactorId] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [qr, setQr] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'enroll' | 'verify'>('verify');

  useEffect(() => { void init(); }, []);

  async function init() {
    setLoading(true);
    setMessage('');
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) { window.location.href = '/login'; return; }
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = (data?.totp ?? []).find((factor: Factor) => factor.status === 'verified');
    if (verified) { setMode('verify'); setFactorId(verified.id); await createChallenge(verified.id); setLoading(false); return; }
    const { data: enrollData, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) { setMessage(error.message); setLoading(false); return; }
    setMode('enroll');
    setFactorId(enrollData.id);
    setQr(enrollData.totp.qr_code);
    const challenge = await supabase.auth.mfa.challenge({ factorId: enrollData.id });
    if (challenge.error) setMessage(challenge.error.message); else setChallengeId(challenge.data.id);
    setLoading(false);
  }

  async function createChallenge(id: string) {
    const { data, error } = await supabase.auth.mfa.challenge({ factorId: id });
    if (error) setMessage(error.message); else setChallengeId(data.id);
  }

  async function verify() {
    setMessage('');
    if (!factorId || !challengeId || !code) { setMessage('Inserisci il codice a 6 cifre.'); return; }
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code: code.trim() });
    if (error) { setMessage(error.message); return; }
    window.location.href = '/dashboard';
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}><div className="container"><div className="card" style={{ maxWidth: 620, margin: '0 auto' }}><p className="eyebrow">Verifica MFA</p><h1 className="page-title">Accesso sicuro</h1><p className="muted">Usa un'app Authenticator per completare l'accesso staff.</p>{loading ? <p className="muted">Caricamento verifica...</p> : null>{!loading && mode === 'enroll' ? <div className="card" style={{ boxShadow: 'none', marginTop: 22 }}><h2>Configura autenticazione</h2><p className="muted">Scansiona il QR code con Google Authenticator, Microsoft Authenticator, 1Password o app compatibile.</p>{qr ? <img src={qr} alt="QR code MFA" style={{ width: 220, height: 220, display: 'block', margin: '20px auto', background: 'white', padding: 10, borderRadius: 16 }} /> : null}</div> : null}{!loading && mode === 'verify' ? <div className="card" style={{ boxShadow: 'none', marginTop: 22 }}><h2>Inserisci codice</h2><p className="muted">Apri la tua app Authenticator e inserisci il codice temporaneo a 6 cifre.</p></div> : null}{!loading ? <div style={{ display: 'grid', gap: 14, marginTop: 22 }}><label><span>Codice 2FA</span><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" /></label><div className="toolbar" style={{ justifyContent: 'flex-start' }}><button className="btn btn-primary" type="button" onClick={verify}>Verifica e continua</button><button className="btn btn-secondary" type="button" onClick={signOut}>Esci</button></div></div> : null}{message ? <p className="badge" style={{ marginTop: 20 }}>{message}</p> : null}<p style={{ marginTop: 22 }}><Link href="/login" style={{ color: 'var(--wine)', fontWeight: 800 }}>Torna al login</Link></p></div></div></main>;
}
