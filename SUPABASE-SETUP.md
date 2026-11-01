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

## India-only validation update

- dist/index.html: fixed non-editable +91 prefix; ten-digit numeric keypad field; accessible India-only help text; scoped stylesheet reference.
- dist/form-validation.css: responsive prefix spacing and invalid-field styling, consistent with existing typography and colors.
- dist/enquiry.js: digit-only entry/paste handling, immediate error clearing, Indian mobile format checks, practical ASCII email syntax validation, E.164 payloads, and field-level Supabase validation responses. Loading/disabled state, data-preserving failures and four-second success confirmation retained.
- tests/enquiry.test.cjs: 18 tests covering mobile starts/lengths/characters/country-code rejection, plus-tag and subdomain emails, malformed addresses, correction behavior, server errors, retries and popup timing.
- supabase/migrations/20261101154822_validate_indian_mobile_and_email.sql: applied database constraints and SECURITY INVOKER RPC validation/normalization. Raw ten-digit or canonical +91 input is accepted at the RPC boundary; other country codes and duplicate prefixes are rejected. The table accepts only canonical Indian E.164 values for new records. Direct REST inserts cannot bypass the format constraints.
- SUPABASE-SETUP.md: configuration, validation and deployment notes.

Mobile rule: exactly ten ASCII digits starting with 6–9; this checks Indian mobile numbering format rather than subscriber assignment or ownership. Reference: https://github.com/google/libphonenumber/blob/master/resources/PhoneNumberMetadata.xml
Email rule: practical unquoted ASCII mailbox syntax, local part at most 64 characters, full address at most 254, valid DNS labels and alphabetic TLD of 2–63 characters. Plus tags and apostrophes are supported. No MX/existence/ownership claim is made.

No new packages, environment variables or services are needed. Existing Supabase URL and publishable key in dist/config.js remain in use. OTP is not enabled: email ownership verification requires email delivery configuration, and Indian SMS OTP requires an SMS provider and applicable sender/template setup. No form submission is marked verified. OTP delivery, resend limits and attempts are not implemented or simulated.

Existing UUID idempotency and in-flight submission lock prevent retry/double-click duplicates. This is not a comprehensive anti-spam rate limiter. Existing legacy test records remain unchanged; NOT VALID constraints enforce all new writes without rewriting historical data.

Validation: 18 JavaScript tests and syntax checks passed. Database transaction tests rejected invalid emails/phones and direct bypass inserts, verified four valid mobile starts, canonical normalization and retry idempotency, then rolled back their test rows. Desktop and 390px mobile checks verified fixed prefix, errors and corrections.
