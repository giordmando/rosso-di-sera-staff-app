import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeProvince, normalizeRegion } from '@/lib/geo/normalize';

export async function POST(request: Request) {
  const body = await request.json();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ message: 'Server non configurato' }, { status: 500 });
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data: edition } = await supabase.from('editions').select('id').eq('year', 2026).single();
  if (!edition) return NextResponse.json({ message: 'Edizione 2026 non configurata' }, { status: 400 });
  const { error } = await supabase.from('exhibitors').insert({
    edition_id: edition.id,
    brand_name: body.brand_name,
    company_name: body.company_name || null,
    contact_name: body.contact_name || null,
    email: body.email || null,
    phone: body.phone || null,
    website_social: body.website_social || null,
    city: body.city || null,
    province: normalizeProvince(body.province),
    region: normalizeRegion(body.region),
    products: body.products || null,
    company_story: body.company_story || null,
    experiences: body.experiences || [],
    media_consent: Boolean(body.media_consent),
    status: 'candidatura_ricevuta',
  });
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ message: 'Candidatura inviata correttamente' });
}
