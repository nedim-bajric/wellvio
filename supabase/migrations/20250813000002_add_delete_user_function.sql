-- Allow an authenticated user to delete their own auth record.
-- This also cascades to public.profiles because of the on delete cascade
-- foreign key, and should be called after application data has been wiped.
create or replace function public.delete_user()
returns void
language sql
security definer
set search_path = public
as $$
  delete from auth.users where id = auth.uid();
$$;

-- Only authenticated users can invoke this function, and only for themselves.
revoke execute on function public.delete_user() from anon;
grant execute on function public.delete_user() to authenticated;
