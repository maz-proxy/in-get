-- Arunika initial schema: owner-scoped workspaces, contacts, and cash transactions.
-- All monetary values are whole units in the organization's configured currency.

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 100),
  currency text not null default 'IDR' check (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  type text not null check (type in ('customer', 'supplier', 'both')),
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_by uuid not null default auth.uid() references auth.users (id),
  description text not null check (char_length(trim(description)) between 1 and 180),
  category text not null default 'Umum' check (char_length(trim(category)) between 1 and 80),
  type text not null check (type in ('income', 'expense')),
  amount bigint not null check (amount > 0),
  transaction_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists contacts_organization_name_idx on public.contacts (organization_id, name);
create index if not exists transactions_organization_date_idx on public.transactions (organization_id, transaction_date desc, created_at desc);
create index if not exists transactions_organization_type_idx on public.transactions (organization_id, type);

alter table public.organizations enable row level security;
alter table public.contacts enable row level security;
alter table public.transactions enable row level security;

create policy "Owners can read their organization"
  on public.organizations for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "Users can create their organization"
  on public.organizations for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "Owners can update their organization"
  on public.organizations for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "Owners can delete their organization"
  on public.organizations for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "Owners can read organization contacts"
  on public.contacts for select to authenticated
  using (exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = (select auth.uid())));
create policy "Owners can create organization contacts"
  on public.contacts for insert to authenticated
  with check (exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = (select auth.uid())));
create policy "Owners can update organization contacts"
  on public.contacts for update to authenticated
  using (exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = (select auth.uid())));
create policy "Owners can delete organization contacts"
  on public.contacts for delete to authenticated
  using (exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = (select auth.uid())));

create policy "Owners can read organization transactions"
  on public.transactions for select to authenticated
  using (exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = (select auth.uid())));
create policy "Owners can create organization transactions"
  on public.transactions for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = (select auth.uid()))
  );
create policy "Owners can update organization transactions"
  on public.transactions for update to authenticated
  using (exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = (select auth.uid())))
  with check (
    created_by = (select auth.uid())
    and exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = (select auth.uid()))
  );
create policy "Owners can delete organization transactions"
  on public.transactions for delete to authenticated
  using (exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = (select auth.uid())));

grant select, insert, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
