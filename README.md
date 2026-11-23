# NEXTDOOR ADS

## Owner setup checklist
- Configure `RESEND_API_KEY` as a server-only encrypted Vercel environment variable. Never use a `VITE_` prefix for secrets.
- Configure `RESEND_TO_EMAIL` as the email address registered with your Resend account while using the Resend testing sender. Resend's testing sender can deliver only to the account's own email address.
- The default sender is `NEXTDOOR ADS <onboarding@resend.dev>`. Once you own a domain, verify it in Resend and set `RESEND_FROM_EMAIL` to an address on that verified domain.
- Redeploy after changing Vercel environment variables. Test the contact form with a real enquiry and confirm it arrives in the configured inbox.
- The quote endpoint sends the enquiry to the studio and sets the customer's email as Reply-To. It does not send an automatic customer confirmation email.
- Add your real email and phone in `src/content/site.ts`. Contact placeholders remain intentionally visible; no social profiles are invented.
- Set `VITE_WHATSAPP_NUMBER` to the international number using digits only. The WhatsApp button remains hidden until configured.
- Supply real studio photography and portfolio images. Current visuals are generated illustrations; all eight projects are Sample Work. Some samples share artwork.
- Confirm draft About story, vision and values. Obtain professional review of Privacy and Terms.
- Connect your actual domain before adding canonical URLs and a production sitemap. Neither uses a fabricated domain.

## Email configuration
Required Vercel variables:
- `RESEND_API_KEY` — encrypted server-side Resend API key.
- `RESEND_TO_EMAIL` — destination inbox. In Resend testing mode, this must be the email address associated with the Resend account.
Optional:
- `RESEND_FROM_EMAIL` — sender identity. Defaults to Resend's `onboarding@resend.dev` testing sender; production sender addresses must belong to a verified domain.

The server endpoint is `POST /api/quote`. It validates the existing quote schema, checks a hidden honeypot field, applies a small per-instance in-memory request limit, and sends the enquiry through Resend. The in-memory limit is best-effort and is not a substitute for a persistent rate limiter or Turnstile. The endpoint never accepts a recipient address from the browser.

## Edit content
- Site details and navigation: `src/content/site.ts`.
- Services and process: `src/content/services.ts`.
- Packages: `src/content/pricing.ts`. Change `price`, `designs` and `visible`. Set `popular: true` only if you want the badge.
- Portfolio: `src/content/portfolio.ts`. Add, edit or remove an entry in the concepts list; use a unique kebab-case slug, a listed category and an imported image. Each entry is validated with Zod. For real client projects, update the schema to allow `isSample: false`, supply permission-cleared client details and images, and make the sample badge conditional.
- A later CMS upgrade can move content to Sanity or Decap while keeping the page components.

## Platform and deployment
This app uses Lovable's supported TanStack Start / React / Tailwind stack, not Next.js. Publish from Lovable for the configured hosting target. A Vercel migration requires a separately tested TanStack-compatible deployment preset; Next.js deployment steps do not apply. No production domain or email credentials are included.

## Current limitations
Automatic studio enquiry delivery is implemented through Resend when the required server environment variables are configured. Customer confirmation emails, persistent rate limiting, Turnstile verification and durable quote storage are not implemented. Canonical URLs, production sitemap and domain-specific CSP are deferred until the domain is known. Lighthouse 90+ targets and Vercel deployment are not certified. Brand PNG/SVG files are under `public/brand`.

## Verification
Run `bunx vitest run` for content and routing checks. Price rules and sample status have concrete tests. Browser checks cover service preselection, portfolio filtering, validation, email delivery states and the mobile menu.

---

# Development

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
