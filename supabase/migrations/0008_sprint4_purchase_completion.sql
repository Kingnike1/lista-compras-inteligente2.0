create or replace function public.complete_purchase(
  p_shopping_list_id uuid,
  p_actual_prices jsonb
)
returns table (purchase_id uuid, total numeric)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_household_id uuid;
  v_store_location_id uuid;
  v_purchase_id uuid;
  v_total numeric(12,2);
  v_checked_count integer;
  v_priced_count integer;
begin
  v_household_id := private.current_household_id();

  if v_household_id is null then
    raise exception 'authenticated household required';
  end if;

  select sl.selected_store_location_id
    into v_store_location_id
  from public.shopping_lists sl
  where sl.id = p_shopping_list_id
    and sl.household_id = v_household_id
    and sl.status = 'active'
  for update;

  if not found then
    raise exception 'active shopping list not found';
  end if;

  if v_store_location_id is null then
    raise exception 'select a store before completing the purchase';
  end if;

  select count(*)
    into v_checked_count
  from public.shopping_list_items sli
  where sli.shopping_list_id = p_shopping_list_id
    and sli.checked = true;

  if v_checked_count = 0 then
    raise exception 'mark at least one purchased item';
  end if;

  with supplied as (
    select item_id, unit_price
    from jsonb_to_recordset(coalesce(p_actual_prices, '[]'::jsonb))
      as x(item_id uuid, unit_price numeric)
  )
  select count(*)
    into v_priced_count
  from public.shopping_list_items sli
  join supplied s on s.item_id = sli.id
  where sli.shopping_list_id = p_shopping_list_id
    and sli.checked = true
    and s.unit_price > 0;

  if v_priced_count <> v_checked_count then
    raise exception 'every purchased item needs a positive actual unit price';
  end if;

  with supplied as (
    select item_id, unit_price
    from jsonb_to_recordset(p_actual_prices)
      as x(item_id uuid, unit_price numeric)
  )
  select round(sum(sli.quantity * s.unit_price), 2)
    into v_total
  from public.shopping_list_items sli
  join supplied s on s.item_id = sli.id
  where sli.shopping_list_id = p_shopping_list_id
    and sli.checked = true;

  insert into public.purchases(
    household_id,
    shopping_list_id,
    store_location_id,
    total
  ) values (
    v_household_id,
    p_shopping_list_id,
    v_store_location_id,
    v_total
  )
  returning id into v_purchase_id;

  with supplied as (
    select item_id, unit_price
    from jsonb_to_recordset(p_actual_prices)
      as x(item_id uuid, unit_price numeric)
  )
  insert into public.purchase_items(
    purchase_id,
    product_id,
    quantity,
    unit,
    unit_price,
    total_price
  )
  select
    v_purchase_id,
    sli.product_id,
    sli.quantity,
    sli.unit,
    s.unit_price,
    round(sli.quantity * s.unit_price, 2)
  from public.shopping_list_items sli
  join supplied s on s.item_id = sli.id
  where sli.shopping_list_id = p_shopping_list_id
    and sli.checked = true;

  with supplied as (
    select item_id, unit_price
    from jsonb_to_recordset(p_actual_prices)
      as x(item_id uuid, unit_price numeric)
  )
  update public.shopping_list_items sli
  set actual_price = s.unit_price
  from supplied s
  where sli.id = s.item_id
    and sli.shopping_list_id = p_shopping_list_id
    and sli.checked = true;

  update public.shopping_lists
  set status = 'completed'
  where id = p_shopping_list_id
    and household_id = v_household_id;

  return query select v_purchase_id, v_total;
end;
$$;

revoke all on function public.complete_purchase(uuid, jsonb) from public;
grant execute on function public.complete_purchase(uuid, jsonb) to authenticated;

alter table public.purchases
  drop constraint if exists purchases_total_nonnegative,
  add constraint purchases_total_nonnegative check (total is null or total >= 0);

alter table public.purchase_items
  drop constraint if exists purchase_items_prices_valid,
  add constraint purchase_items_prices_valid check (
    quantity > 0
    and unit_price is not null
    and unit_price > 0
    and total_price > 0
  );