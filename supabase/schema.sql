create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  role text not null default 'operator' check (role in ('admin','operator')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.editions (
  id uuid primary key default uuid_generate_v4(),
  year integer not null unique,
  name text not null,
  location text not null default 'Villa Bonaparte, Porto San Giorgio',
  max_exhibitors integer not null default 45,
  exhibitor_fee numeric(10,2) not null default 183.00,
  google_spreadsheet_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.exhibitor_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.exhibitors (
  id uuid primary key default uuid_generate_v4(),
  edition_id uuid not null references public.editions(id) on delete cascade,
  type_id uuid references public.exhibitor_types(id),
  company_name text,
  brand_name text not null,
  contact_name text,
  phone text,
  email text,
  website_social text,
  city text,
  province text,
  region text,
  products text,
  company_story text,
  visitable boolean,
  experiences text[],
  media_consent boolean default false,
  status text not null default 'candidatura_ricevuta' check (status in ('bozza','candidatura_ricevuta','in_valutazione','accettato','in_attesa_pagamento','confermato','rifiutato','rinunciato')),
  internal_notes text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  exhibitor_id uuid not null references public.exhibitors(id) on delete cascade,
  expected_amount numeric(10,2) not null default 183.00,
  paid_amount numeric(10,2) not null,
  payment_method text,
  payment_date date,
  receipt_received boolean not null default false,
  notes text,
  registered_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create table public.sheet_sync_logs (
  id uuid primary key default uuid_generate_v4(),
  edition_id uuid not null references public.editions(id) on delete cascade,
  sync_type text not null check (sync_type in ('export','import')),
  status text not null check (status in ('success','error','conflict')),
  details jsonb,
  executed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
