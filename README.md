# Ashtavinayak Design

The existing Atelier project, expanded into the Ashtavinayak Design studio website using the supplied logo. Buildless HTML, CSS and JavaScript; no install step or external runtime dependencies.

## Run locally

Requires Node.js 18 or later. From this folder:

    npm start

Open http://127.0.0.1:3000. The static deployable website is in `dist/`.

    npm run check
    npm test

## Content and branding

- Original interactive hero composition retained, with the supplied sketch, architectural model and finished living-room image. WebP copies of sketch/model and logo reduce page weight. Uniform registration transforms remain in `dist/hero.js`.
- Supplied Ashtavinayak Design logo in navigation and footer. Burgundy accents come from the logo; the original white space and black sans-serif hero typography remain. Georgia italic is a supporting section-heading treatment, with no webfont dependency.
- Rammurti Maurya is identified as proprietor in About, Contact and footer. The full address is the address supplied by the owner, including postal code 421201. An exact studio pin was not independently verified, so no map link or unverified directions are shown.
- All gallery images are explicitly identified as design references, not completed studio projects. No unverified project names, clients, awards, team credentials, opening hours, business phone, email or social handles have been invented. The client-stories area is clearly a placeholder awaiting verified feedback.
- Seven requested service categories and six process stages are included. These are the service/process descriptions requested in the brief, not independently verified business history.

## Enquiry integration (not live until configured)

The form has exactly four required inputs: Name, Email, Phone and Message. Required/email/phone validation, loading, failure, timeout and confirmed-success states are implemented. Copy enquiry is a working local fallback. The default empty endpoint does not transmit or save customer data and never displays a delivery-success message.

To enable submissions:

1. Implement an HTTPS endpoint that accepts `POST` JSON with exactly `name`, `email`, `phone`, `message` strings. A same-origin relative endpoint is supported.
2. Validate and sanitize fields on the server; apply rate limiting/spam protection and appropriate data retention/access controls. Configure actual delivery or durable storage for the studio. API/email credentials must stay on the server.
3. Return a 2xx JSON response with `{ "success": true }` only after the enquiry has been durably accepted for delivery/storage. Any other result is shown as an error and the visitor's fields are retained. If cross-origin, allow the site's origin with CORS.
4. Set `window.STUDIO_CONFIG.enquiryEndpoint` in `dist/config.js` to the real URL. No secrets go in this public file.
5. Verify receipt end to end before treating online enquiries as operational.

No backend, business inbox or delivery credentials were provided. A static demo endpoint that always says success has intentionally not been added.

## Files

- `dist/index.html`: semantic page and four-field enquiry form.
- `dist/style.css`: retained hero styling.
- `dist/site.css`: responsive studio website.
- `dist/hero.js`: DPR-aware Canvas reveal, stationary aligned layers, fading organic brush masks, idle demo, reduced-motion static reveal and offscreen pause.
- `dist/site.js`: menu, section entrance effects, service accordion, reference filters and accessible native dialog.
- `dist/enquiry.js`: validation, integration request states and copy enquiry.
- `dist/config.js`: public endpoint setting.
- `tests/enquiry.test.cjs`: required-field, invalid-input, unconfigured, loading, explicit acknowledgement, HTTP/network failure and copy behavior checks using a mocked endpoint.

## Image credits

All photographs are stored locally; no runtime third-party image requests.

- Hero stages and studio logo: supplied by the user.
- Kitchen: Clay Banks, https://unsplash.com/photos/avPVKD07Fcg
- Bedroom: Clay Banks, https://unsplash.com/photos/Xbe5BfScmvM
- Workspace: Deliberate Directions, https://unsplash.com/photos/yTrgkVaY1TM
- Stock photographs are used under the Unsplash License: https://unsplash.com/license

## Validation

Checked in the browser at 1440×960, 768×1024 and 390×844. No horizontal overflow at these widths. Hero stages, mobile navigation, service accordion, gallery category filtering, reference dialog, contact anchors, required/email/phone validation and local copy behavior were exercised. Browser errors and asset failures were checked. Seven enquiry tests include simulated server success and failures; these are tests, not an operational delivery backend.

The retained hero uses requestAnimationFrame, preloaded image decoding, device-pixel-ratio scaling and passive pointer listeners with pan-y. Reduced-motion disables its animation. The supplied stages differ in geometry, so landmark registration is approximate and a narrow textured wireframe border softens the transition.

Original supplied PNG assets are preserved in source-assets/; optimized WebP copies are used by the page.
