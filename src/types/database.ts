export type UserRole = 'admin' | 'operator';

export type ExhibitorStatus =
  | 'bozza'
  | 'candidatura_ricevuta'
  | 'in_valutazione'
  | 'accettato'
  | 'in_attesa_pagamento'
  | 'confermato'
  | 'rifiutato'
  | 'rinunciato';

export type Edition = {
  id: string;
  year: number;
  name: string;
  location: string;
  max_exhibitors: number;
  exhibitor_fee: number;
  google_spreadsheet_id: string | null;
  is_active: boolean;
  created_at: string;
};

export type ExhibitorType = {
  id: string;
  name: string;
};

export type Exhibitor = {
  id: string;
  edition_id: string;
  type_id: string | null;
  company_name: string | null;
  brand_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website_social: string | null;
  city: string | null;
  province: string | null;
  region: string | null;
  products: string | null;
  company_story: string | null;
  visitable: boolean | null;
  experiences: string[] | null;
  media_consent: boolean;
  status: ExhibitorStatus;
  internal_notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  exhibitor_id: string;
  expected_amount: number;
  paid_amount: number;
  payment_method: string | null;
  payment_date: string | null;
  receipt_received: boolean;
  notes: string | null;
  registered_by: string | null;
  created_at: string;
};
