alter table public.user_profiles add column if not exists display_name text;
alter table public.user_profiles add column if not exists updated_at timestamptz not null default now();
alter table public.households add column if not exists updated_at timestamptz not null default now();
alter table public.products add column if not exists updated_at timestamptz not null default now();

alter table public.products drop constraint if exists products_package_unit_check;
alter table public.products add constraint products_package_unit_check check (package_unit is null or package_unit in ('kg','g','l','ml','unit','roll','package'));
alter table public.inventory_items drop constraint if exists inventory_items_unit_check;
alter table public.inventory_items add constraint inventory_items_unit_check check (unit is null or unit in ('kg','g','l','ml','unit','roll','package'));
alter table public.products drop constraint if exists products_package_quantity_positive;
alter table public.products add constraint products_package_quantity_positive check (package_quantity is null or package_quantity > 0);
alter table public.inventory_items drop constraint if exists inventory_registered_quantity_nonnegative;
alter table public.inventory_items add constraint inventory_registered_quantity_nonnegative check (registered_quantity >= 0);
alter table public.inventory_items drop constraint if exists inventory_estimated_quantity_nonnegative;
alter table public.inventory_items add constraint inventory_estimated_quantity_nonnegative check (estimated_quantity is null or estimated_quantity >= 0);

create or replace function private.touch_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
revoke all on function private.touch_updated_at() from public, anon, authenticated;
grant execute on function private.touch_updated_at() to service_role;

drop trigger if exists households_touch_updated_at on public.households;
create trigger households_touch_updated_at before update on public.households for each row execute function private.touch_updated_at();
drop trigger if exists user_profiles_touch_updated_at on public.user_profiles;
create trigger user_profiles_touch_updated_at before update on public.user_profiles for each row execute function private.touch_updated_at();
drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at before update on public.products for each row execute function private.touch_updated_at();

create or replace function private.sync_inventory_status() returns trigger language plpgsql security invoker set search_path = '' as $$ begin if new.registered_quantity <= 0 then new.status='out'; elsif new.status='out' then new.status='in_stock'; end if; new.updated_at=now(); return new; end; $$;
revoke all on function private.sync_inventory_status() from public, anon, authenticated;
grant execute on function private.sync_inventory_status() to service_role;
drop trigger if exists inventory_sync_status on public.inventory_items;
create trigger inventory_sync_status before insert or update of registered_quantity on public.inventory_items for each row execute function private.sync_inventory_status();

create index if not exists products_household_name_idx on public.products(household_id, lower(name));
create index if not exists inventory_household_status_idx on public.inventory_items(household_id,status);
