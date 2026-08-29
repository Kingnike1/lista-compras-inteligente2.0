grant select, insert on table public.stores to authenticated;
grant select, insert on table public.store_locations to authenticated;
grant select, insert on table public.prices to authenticated;

create policy stores_insert_authenticated
on public.stores
for insert
to authenticated
with check (true);

create policy store_locations_insert_authenticated
on public.store_locations
for insert
to authenticated
with check (true);

create policy prices_insert_accessible_product
on public.prices
for insert
to authenticated
with check (
  private.can_access_product(product_id)
  and source_type = 'manual'
  and price >= 0
  and valid_until >= observed_at
);

create index if not exists store_locations_city_store_idx
  on public.store_locations(city, store_id);
create index if not exists prices_location_valid_product_idx
  on public.prices(store_location_id, valid_until desc, product_id);
