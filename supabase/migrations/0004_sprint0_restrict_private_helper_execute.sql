revoke all on function private.current_household_id() from public, anon;
revoke all on function private.is_household_member(uuid) from public, anon;
revoke all on function private.can_access_product(uuid) from public, anon;
revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.protect_user_profile_identity() from public, anon, authenticated;

grant execute on function private.current_household_id() to authenticated, service_role;
grant execute on function private.is_household_member(uuid) to authenticated, service_role;
grant execute on function private.can_access_product(uuid) to authenticated, service_role;
grant execute on function private.handle_new_user() to service_role;
grant execute on function private.protect_user_profile_identity() to service_role;
