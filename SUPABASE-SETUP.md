# Supabase enquiry connection

Project: ikzhrovuaxgxjpznyxqw
Table: public.website_enquiries
Dashboard: https://supabase.com/dashboard/project/ikzhrovuaxgxjpznyxqw/editor

Enquiries and consultation requests share this table. Columns: id, created_at, name, email, phone, message, request_type. The Book a Consultation link selects consultation; other Contact links select enquiry.

Database migrations were applied and verified through the authenticated Supabase connection. RLS is enabled. Anonymous and authenticated visitors may insert only submission fields; they cannot SELECT, UPDATE or DELETE records or set created_at. The submission function uses SECURITY INVOKER and table constraints enforce field lengths, required values and basic formats. UUID request IDs prevent duplicate inserts on unchanged retries. The browser contains only a publishable API key.

Success appears only after the database acknowledges the save. A visual confirmation popup closes after four seconds; the inline accessible confirmation stays visible. Failed requests preserve the fields and do not show a success popup. Copy enquiry remains a local-only action.

Validation: 11 automated tests, JavaScript checks, real browser enquiry/consultation submissions verified in the database, desktop/mobile notification checks, and database permission checks passed. Test rows use connection-test@example.com, names beginning Website, and TEST ONLY messages; these are not customer leads.

No email notification delivery is configured. The website saves requests for viewing in Supabase Table Editor. Public endpoints can receive spam; CAPTCHA/server rate limits remain a future addition.

Security advisor: no findings on the submission table/function after hardening. The project's pre-existing public.rls_auto_enable event-trigger function has a public-execution advisory; it was not changed as part of this integration. Reference: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
