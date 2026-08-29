create or replace function public.current_household_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select household_id
  from public.user_profiles
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and household_id = target_household_id
  );
$$;

create or replace function public.can_access_product(target_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.products p
    where p.id = target_product_id
      and (p.household_id is null or public.is_household_member(p.household_id))
  );
$$;

revoke all on function public.current_household_id() from public;
revoke all on function public.is_household_member(uuid) from public;
revoke all on function public.can_access_product(uuid) from public;
grant execute on function public.current_household_id() to authenticated, service_role;
grant execute on function public.is_household_member(uuid) to authenticated, service_role;
grant execute on function public.can_access_product(uuid) to authenticated, service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_household_id uuid;
begin
  if exists (select 1 from public.user_profiles where id = new.id) then
    return new;
  end if;
  insert into public.households(name) values ('Minha Casa') returning id into new_household_id;
  insert into public.user_profiles(id, household_id) values (new.id, new_household_id);
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.protect_user_profile_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user <> 'postgres' and coalesce(auth.role(), '') <> 'service_role' then
    if new.id is distinct from old.id then raise exception 'profile id cannot be changed'; end if;
    if new.household_id is distinct from old.household_id then raise exception 'household membership cannot be changed directly'; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_user_profile_identity_trigger on public.user_profiles;
create trigger protect_user_profile_identity_trigger before update on public.user_profiles
for each row execute function public.protect_user_profile_identity();

alter table public.households enable row level security;
alter table public.user_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.stores enable row level security;
alter table public.store_locations enable row level security;
alter table public.prices enable row level security;
alter table public.inventory_items enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;

drop policy if exists user_profiles_select_own on public.user_profiles;
create policy user_profiles_select_own on public.user_profiles for select to authenticated using (id = auth.uid());
drop policy if exists user_profiles_update_own on public.user_profiles;
create policy user_profiles_update_own on public.user_profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists households_select_member on public.households;
create policy households_select_member on public.households for select to authenticated using (public.is_household_member(id));
drop policy if exists households_update_member on public.households;
create policy households_update_member on public.households for update to authenticated using (public.is_household_member(id)) with check (public.is_household_member(id));

drop policy if exists categories_select_authenticated on public.categories;
create policy categories_select_authenticated on public.categories for select to authenticated using (true);
drop policy if exists stores_select_authenticated on public.stores;
create policy stores_select_authenticated on public.stores for select to authenticated using (true);
drop policy if exists store_locations_select_authenticated on public.store_locations;
create policy store_locations_select_authenticated on public.store_locations for select to authenticated using (true);

drop policy if exists products_select_accessible on public.products;
create policy products_select_accessible on public.products for select to authenticated using (household_id is null or public.is_household_member(household_id));
drop policy if exists products_insert_own_household on public.products;
create policy products_insert_own_household on public.products for insert to authenticated with check (household_id = public.current_household_id());
drop policy if exists products_update_own_household on public.products;
create policy products_update_own_household on public.products for update to authenticated using (household_id = public.current_household_id()) with check (household_id = public.current_household_id());
drop policy if exists products_delete_own_household on public.products;
create policy products_delete_own_household on public.products for delete to authenticated using (household_id = public.current_household_id());

drop policy if exists prices_select_accessible_product on public.prices;
create policy prices_select_accessible_product on public.prices for select to authenticated using (public.can_access_product(product_id));

drop policy if exists inventory_select_own on public.inventory_items;
create policy inventory_select_own on public.inventory_items for select to authenticated using (household_id = public.current_household_id());
drop policy if exists inventory_insert_own on public.inventory_items;
create policy inventory_insert_own on public.inventory_items for insert to authenticated with check (household_id = public.current_household_id() and public.can_access_product(product_id));
drop policy if exists inventory_update_own on public.inventory_items;
create policy inventory_update_own on public.inventory_items for update to authenticated using (household_id = public.current_household_id()) with check (household_id = public.current_household_id() and public.can_access_product(product_id));
drop policy if exists inventory_delete_own on public.inventory_items;
create policy inventory_delete_own on public.inventory_items for delete to authenticated using (household_id = public.current_household_id());

drop policy if exists shopping_lists_select_own on public.shopping_lists;
create policy shopping_lists_select_own on public.shopping_lists for select to authenticated using (household_id = public.current_household_id());
drop policy if exists shopping_lists_insert_own on public.shopping_lists;
create policy shopping_lists_insert_own on public.shopping_lists for insert to authenticated with check (household_id = public.current_household_id());
drop policy if exists shopping_lists_update_own on public.shopping_lists;
create policy shopping_lists_update_own on public.shopping_lists for update to authenticated using (household_id = public.current_household_id()) with check (household_id = public.current_household_id());
drop policy if exists shopping_lists_delete_own on public.shopping_lists;
create policy shopping_lists_delete_own on public.shopping_lists for delete to authenticated using (household_id = public.current_household_id());

drop policy if exists shopping_list_items_select_own on public.shopping_list_items;
create policy shopping_list_items_select_own on public.shopping_list_items for select to authenticated using (exists (select 1 from public.shopping_lists sl where sl.id = shopping_list_id and sl.household_id = public.current_household_id()));
drop policy if exists shopping_list_items_insert_own on public.shopping_list_items;
create policy shopping_list_items_insert_own on public.shopping_list_items for insert to authenticated with check (exists (select 1 from public.shopping_lists sl where sl.id = shopping_list_id and sl.household_id = public.current_household_id()) and public.can_access_product(product_id));
drop policy if exists shopping_list_items_update_own on public.shopping_list_items;
create policy shopping_list_items_update_own on public.shopping_list_items for update to authenticated using (exists (select 1 from public.shopping_lists sl where sl.id = shopping_list_id and sl.household_id = public.current_household_id())) with check (exists (select 1 from public.shopping_lists sl where sl.id = shopping_list_id and sl.household_id = public.current_household_id()) and public.can_access_product(product_id));
drop policy if exists shopping_list_items_delete_own on public.shopping_list_items;
create policy shopping_list_items_delete_own on public.shopping_list_items for delete to authenticated using (exists (select 1 from public.shopping_lists sl where sl.id = shopping_list_id and sl.household_id = public.current_household_id()));

drop policy if exists purchases_select_own on public.purchases;
create policy purchases_select_own on public.purchases for select to authenticated using (household_id = public.current_household_id());
drop policy if exists purchases_insert_own on public.purchases;
create policy purchases_insert_own on public.purchases for insert to authenticated with check (household_id = public.current_household_id());
drop policy if exists purchases_update_own on public.purchases;
create policy purchases_update_own on public.purchases for update to authenticated using (household_id = public.current_household_id()) with check (household_id = public.current_household_id());
drop policy if exists purchases_delete_own on public.purchases;
create policy purchases_delete_own on public.purchases for delete to authenticated using (household_id = public.current_household_id());

drop policy if exists purchase_items_select_own on public.purchase_items;
create policy purchase_items_select_own on public.purchase_items for select to authenticated using (exists (select 1 from public.purchases p where p.id = purchase_id and p.household_id = public.current_household_id()));
drop policy if exists purchase_items_insert_own on public.purchase_items;
create policy purchase_items_insert_own on public.purchase_items for insert to authenticated with check (exists (select 1 from public.purchases p where p.id = purchase_id and p.household_id = public.current_household_id()) and public.can_access_product(product_id));
drop policy if exists purchase_items_update_own on public.purchase_items;
create policy purchase_items_update_own on public.purchase_items for update to authenticated using (exists (select 1 from public.purchases p where p.id = purchase_id and p.household_id = public.current_household_id())) with check (exists (select 1 from public.purchases p where p.id = purchase_id and p.household_id = public.current_household_id()) and public.can_access_product(product_id));
drop policy if exists purchase_items_delete_own on public.purchase_items;
create policy purchase_items_delete_own on public.purchase_items for delete to authenticated using (exists (select 1 from public.purchases p where p.id = purchase_id and p.household_id = public.current_household_id()));
