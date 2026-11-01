grant insert (id, name, email, phone, message, request_type) on public.website_enquiries to anon, authenticated;
create policy website_submission_insert on public.website_enquiries for insert to anon, authenticated with check (true);
create or replace function public.submit_website_enquiry(
p_id uuid, p_name text, p_email text, p_phone text, p_message text, p_request_type text default 'enquiry'
) returns jsonb language plpgsql security invoker set search_path = '' as $$
begin
  begin
    insert into public.website_enquiries (id, name, email, phone, message, request_type)
    values (p_id, btrim(p_name), btrim(p_email), btrim(p_phone), btrim(p_message), p_request_type);
  exception when unique_violation then
    -- UUID is a client-generated idempotency key; an existing ID is never updated.
    null;
  end;
  return jsonb_build_object('success', true, 'id', p_id);
end;
$$;
notify pgrst, 'reload schema';
