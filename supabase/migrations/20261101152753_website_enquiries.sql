-- Website submissions are writable only through the narrowly scoped RPC below.
create table if not exists public.website_enquiries (
  id uuid primary key,
  created_at timestamptz not null default now(),
  name text not null check (length(btrim(name)) between 1 and 120),
  email text not null check (length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text not null check (length(phone) <= 24 and phone ~ '^\+?[0-9 ().-]+$' and length(regexp_replace(phone, '[^0-9]', '', 'g')) between 7 and 15),
  message text not null check (length(btrim(message)) between 1 and 5000),
  request_type text not null check (request_type in ('enquiry', 'consultation'))
);
alter table public.website_enquiries enable row level security;
revoke all on public.website_enquiries from anon, authenticated;
create or replace function public.submit_website_enquiry(
  p_id uuid, p_name text, p_email text, p_phone text, p_message text, p_request_type text default 'enquiry'
) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.website_enquiries (id, name, email, phone, message, request_type)
  values (p_id, btrim(p_name), btrim(p_email), btrim(p_phone), btrim(p_message), p_request_type)
  on conflict (id) do nothing;
  if not exists (
    select 1 from public.website_enquiries where id = p_id
      and name = btrim(p_name) and email = btrim(p_email) and phone = btrim(p_phone)
      and message = btrim(p_message) and request_type = p_request_type
  ) then raise exception 'Submission ID already used'; end if;
  return jsonb_build_object('success', true, 'id', p_id);
end;
$$;
revoke all on function public.submit_website_enquiry(uuid, text, text, text, text, text) from public;
grant usage on schema public to anon, authenticated;
grant execute on function public.submit_website_enquiry(uuid, text, text, text, text, text) to anon, authenticated;
notify pgrst, 'reload schema';
