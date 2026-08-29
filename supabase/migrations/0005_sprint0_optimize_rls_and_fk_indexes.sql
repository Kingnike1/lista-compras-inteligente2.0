drop policy if exists user_profiles_select_own on public.user_profiles;
create policy user_profiles_select_own on public.user_profiles
for select to authenticated
using (id = (select auth.uid()));

drop policy if exists user_profiles_update_own on public.user_profiles;
create policy user_profiles_update_own on public.user_profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create index if not exists user_profiles_household_id_idx on public.user_profiles(household_id);
create index if not exists products_household_id_idx on public.products(household_id);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists store_locations_store_id_idx on public.store_locations(store_id);
create index if not exists prices_store_location_id_idx on public.prices(store_location_id);
create index if not exists inventory_items_product_id_idx on public.inventory_items(product_id);
create index if not exists shopping_lists_selected_store_location_id_idx on public.shopping_lists(selected_store_location_id);
create index if not exists shopping_list_items_shopping_list_id_idx on public.shopping_list_items(shopping_list_id);
create index if not exists shopping_list_items_product_id_idx on public.shopping_list_items(product_id);
create index if not exists purchases_household_id_idx on public.purchases(household_id);
create index if not exists purchases_shopping_list_id_idx on public.purchases(shopping_list_id);
create index if not exists purchases_store_location_id_idx on public.purchases(store_location_id);
create index if not exists purchase_items_purchase_id_idx on public.purchase_items(purchase_id);
create index if not exists purchase_items_product_id_idx on public.purchase_items(product_id);
