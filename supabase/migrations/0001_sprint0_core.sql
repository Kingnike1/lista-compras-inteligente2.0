create extension if not exists pgcrypto;

create type public.inventory_status as enum ('in_stock', 'low', 'out');
create type public.shopping_priority as enum ('essential', 'necessary', 'desirable', 'optional');
create type public.shopping_list_status as enum ('draft', 'active', 'completed', 'cancelled');

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Minha Casa',
  city text,
  created_at timestamptz not null default now()
);

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete set null,
  city text,
  shopping_profile text not null default 'balanced' check (shopping_profile in ('economic','balanced','practical')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  section_order integer not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  brand text,
  package_quantity numeric,
  package_unit text,
  locked boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.store_locations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  city text not null,
  label text,
  address text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now()
);

create table public.prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  store_location_id uuid not null references public.store_locations(id) on delete cascade,
  price numeric(12,2) not null check (price >= 0),
  unit_price numeric(12,4),
  source_type text not null check (source_type in ('manual','api')),
  source_ref text,
  confidence numeric(4,3) check (confidence between 0 and 1),
  observed_at timestamptz not null default now(),
  valid_until timestamptz not null default (now() + interval '7 days')
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  registered_quantity numeric not null default 0,
  estimated_quantity numeric,
  unit text,
  status public.inventory_status not null default 'in_stock',
  updated_at timestamptz not null default now(),
  unique (household_id, product_id)
);

create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  budget numeric(12,2),
  planned_days integer,
  selected_store_location_id uuid references public.store_locations(id) on delete set null,
  status public.shopping_list_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references public.shopping_lists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity numeric not null default 1,
  unit text,
  priority public.shopping_priority not null default 'necessary',
  expected_price numeric(12,2),
  actual_price numeric(12,2),
  checked boolean not null default false
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  shopping_list_id uuid references public.shopping_lists(id) on delete set null,
  store_location_id uuid references public.store_locations(id) on delete set null,
  total numeric(12,2),
  purchased_at timestamptz not null default now()
);

create table public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity numeric not null,
  unit text,
  unit_price numeric(12,4),
  total_price numeric(12,2) not null
);

create index prices_product_location_observed_idx on public.prices(product_id, store_location_id, observed_at desc);
create index inventory_household_idx on public.inventory_items(household_id);
create index lists_household_status_idx on public.shopping_lists(household_id, status);
