-- Run this in Supabase SQL Editor

-- Academies (one per customer)
create table academies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive', -- inactive, active, past_due, canceled
  plan text default 'none', -- none, setup, subscription
  created_at timestamptz default now()
);

-- Players
create table players (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid references academies(id) on delete cascade,
  name text not null,
  age int,
  level text default 'Beginner', -- Beginner, Intermediate, Advanced, Competitive
  coach_name text,
  parent_email text,
  parent_name text,
  monthly_fee int default 0,
  status text default 'active', -- active, inactive
  notes text,
  created_at timestamptz default now()
);

-- Invoices
create table invoices (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid references academies(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  amount int not null,
  status text default 'pending', -- pending, paid, overdue
  due_date date,
  paid_at timestamptz,
  month text, -- e.g. "May 2025"
  created_at timestamptz default now()
);

-- Coaches
create table coaches (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid references academies(id) on delete cascade,
  name text not null,
  email text,
  specialty text,
  status text default 'active',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table academies enable row level security;
alter table players enable row level security;
alter table invoices enable row level security;
alter table coaches enable row level security;

-- RLS Policies: users can only see their own academy's data
create policy "owner can manage academy" on academies
  for all using (owner_id = auth.uid());

create policy "academy members can manage players" on players
  for all using (
    academy_id in (select id from academies where owner_id = auth.uid())
  );

create policy "academy members can manage invoices" on invoices
  for all using (
    academy_id in (select id from academies where owner_id = auth.uid())
  );

create policy "academy members can manage coaches" on coaches
  for all using (
    academy_id in (select id from academies where owner_id = auth.uid())
  );
