# NEXTDOOR ADS

## Owner setup checklist
- Connect Resend and verify a sender domain you own. Email delivery was skipped during setup and is NOT implemented or operational.
- Supply your destination email, verified sender email, and Turnstile site/secret keys. Then request activation of the quote handler, client confirmation email and server-side spam protection. The current form validates inputs but clearly reports that nothing was sent or stored.
- Add your real email and phone in `src/content/site.ts`. Contact placeholders remain intentionally visible; no social profiles are invented.
- Set `VITE_WHATSAPP_NUMBER` to the international number using digits only. The WhatsApp button remains hidden until configured.
- Supply real studio photography and portfolio images. Current visuals are generated illustrations; all eight projects are Sample Work. Some samples share artwork.
- Confirm draft About story, vision and values. Obtain professional review of Privacy and Terms.
- Connect your actual domain before adding canonical URLs and a production sitemap. Neither uses a fabricated domain.

## Edit content
- Site details and navigation: `src/content/site.ts`.
- Services and process: `src/content/services.ts`.
- Packages: `src/content/pricing.ts`. Change `price`, `designs` and `visible`. Set `popular: true` only if you want the badge.
- Portfolio: `src/content/portfolio.ts`. Add, edit or remove an entry in the concepts list; use a unique kebab-case slug, a listed category and an imported image. Each entry is validated with Zod. For real client projects, update the schema to allow `isSample: false`, supply permission-cleared client details and images, and make the sample badge conditional.
- A later CMS upgrade can move content to Sanity or Decap while keeping the page components.

## Platform and deployment
This app uses Lovable's supported TanStack Start / React / Tailwind stack, not Next.js. Publish from Lovable for the configured hosting target. A Vercel migration requires a separately tested TanStack-compatible deployment preset; Next.js deployment steps do not apply. No production domain or email credentials are included.

## Current limitations
Quote delivery, confirmation emails, Turnstile verification and rate limiting are blocked by skipped email setup and missing credentials. No quote API or simulated success is shipped. Canonical URLs, production sitemap and domain-specific CSP are deferred until the domain is known. Lighthouse 90+ targets and Vercel deployment are not certified. Brand PNG/SVG files are under `public/brand`.

## Verification
Run `bunx vitest run` for content and routing checks. Price rules and sample status have concrete tests. Browser checks cover service preselection, portfolio filtering, validation, honest delivery-unavailable errors and the mobile menu.

---

# Development

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
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
