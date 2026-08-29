create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

alter function public.current_household_id() set schema private;
alter function public.is_household_member(uuid) set schema private;
alter function public.can_access_product(uuid) set schema private;
alter function public.handle_new_user() set schema private;
alter function public.protect_user_profile_identity() set schema private;

create or replace function private.current_household_id()
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

create or replace function private.is_household_member(target_household_id uuid)
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

create or replace function private.can_access_product(target_product_id uuid)
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
      and (p.household_id is null or private.is_household_member(p.household_id))
  );
$$;

create or replace function private.handle_new_user()
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

  insert into public.households(name)
  values ('Minha Casa')
  returning id into new_household_id;

  insert into public.user_profiles(id, household_id)
  values (new.id, new_household_id);

  return new;
end;
$$;

create or replace function private.protect_user_profile_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user <> 'postgres' and coalesce(auth.role(), '') <> 'service_role' then
    if new.id is distinct from old.id then
      raise exception 'profile id cannot be changed';
    end if;
    if new.household_id is distinct from old.household_id then
      raise exception 'household membership cannot be changed directly';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.current_household_id() from public;
revoke all on function private.is_household_member(uuid) from public;
revoke all on function private.can_access_product(uuid) from public;
revoke all on function private.handle_new_user() from public;
revoke all on function private.protect_user_profile_identity() from public;

grant execute on function private.current_household_id() to authenticated, service_role;
grant execute on function private.is_household_member(uuid) to authenticated, service_role;
grant execute on function private.can_access_product(uuid) to authenticated, service_role;
grant execute on function private.handle_new_user() to service_role;
grant execute on function private.protect_user_profile_identity() to service_role;

-- Triggers keep the same function OIDs when the functions are moved, but recreate
-- them explicitly so a clean database has an obvious and auditable dependency.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

drop trigger if exists protect_user_profile_identity_trigger on public.user_profiles;
create trigger protect_user_profile_identity_trigger
  before update on public.user_profiles
  for each row execute function private.protect_user_profile_identity();
