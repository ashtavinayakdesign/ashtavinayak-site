create or replace function public.website_email_valid(value text)
returns boolean language sql immutable security invoker set search_path = '' as $$
 select coalesce(
  length(value) between 3 and 254
  and length(split_part(value, '@', 1)) between 1 and 64
  and value ~ '^[A-Za-z0-9!#$%&''*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&''*+/=?^_`{|}~-]+)*@([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$', false);
$$;
-- NOT VALID preserves older records; all new inserts/updates must pass these checks.
alter table public.website_enquiries add constraint website_enquiries_indian_mobile check (phone ~ '^\+91[6-9][0-9]{9}$') not valid;
alter table public.website_enquiries add constraint website_enquiries_valid_email check (public.website_email_valid(email)) not valid;
create or replace function public.submit_website_enquiry(
 p_id uuid, p_name text, p_email text, p_phone text, p_message text, p_request_type text default 'enquiry'
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 errors jsonb := '{}'::jsonb;
 national_phone text;
 clean_phone text := btrim(p_phone);
begin
 if p_name is null or length(btrim(p_name)) not between 1 and 120 then
  errors := errors || jsonb_build_object('name','Please enter a name of 1–120 characters.');
 end if;
 if not public.website_email_valid(btrim(p_email)) then
  errors := errors || jsonb_build_object('email','Please enter a valid email address, such as name@example.com.');
 end if;
 if clean_phone ~ '^[6-9][0-9]{9}$' then national_phone := clean_phone;
 elsif clean_phone ~ '^\+91[6-9][0-9]{9}$' then national_phone := substring(clean_phone from 4);
 else errors := errors || jsonb_build_object('phone','Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.');
 end if;
 if p_message is null or length(btrim(p_message)) not between 1 and 5000 then
  errors := errors || jsonb_build_object('message','Please enter a message of 1–5,000 characters.');
 end if;
 if p_request_type is null or p_request_type not in ('enquiry','consultation') or p_id is null then
  return jsonb_build_object('success',false,'errors',jsonb_build_object('message','Please reload the form and try again.'));
 end if;
 if errors <> '{}'::jsonb then return jsonb_build_object('success',false,'errors',errors); end if;
 begin
  insert into public.website_enquiries (id,name,email,phone,message,request_type)
  values (p_id,btrim(p_name),btrim(p_email),'+91'||national_phone,btrim(p_message),p_request_type);
 exception when unique_violation then null; -- existing UUID retries never create a second row
 end;
 return jsonb_build_object('success',true,'id',p_id);
end;
$$;
notify pgrst, 'reload schema';
