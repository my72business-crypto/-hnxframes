# HNX Frames — Portfolio Site
## Deploy to Cloudflare Pages (Free)

1. Push this folder to a GitHub repo
2. Go to dash.cloudflare.com → Pages → Create a project
3. Connect GitHub → select your repo
4. Build settings: leave blank (static site)
5. Deploy — done. Your site is live in ~60 seconds.

## Replace Placeholder Content

### Images
Replace the coloured `.gallery-placeholder` / `.reel-placeholder` / `.about-placeholder` divs
with real `<img>` tags inside `.gallery-img-wrap`.

Recommended dimensions:
- Hero background: 2560 × 1440px (landscape)
- Gallery tall card: 900 × 1200px (portrait)
- Gallery standard card: 900 × 600px (landscape)
- Gallery wide card: 1600 × 700px (landscape)
- Reel thumbnails: 640 × 400px (16:9)
- About section background: 2000 × 1200px

### Contacts
Search for these and replace with your real details:
- `hello@hnxframes.dxb`  → your email
- `+971 50 000 0000`     → your WhatsApp number
- `https://wa.me/971500000000` → your WhatsApp link

### Stats
In `index.html` search `data-count=` and update the numbers.

### Form Backend
The form currently simulates a send. To make it real, use Formspree (free):
1. Sign up at formspree.io
2. Create a form, get your endpoint URL
3. Replace the `await new Promise(...)` simulate block in `main.js` with:
   `await fetch('https://formspree.io/f/YOUR_ID', { method:'POST', body: new FormData(form) })`

## Recommended Portfolio Image Order (Hero sequence)
1. Your most dramatic / cinematic hero shot (dark + gold tones)
2. A luxury marque — Lambo / Ferrari / Rolls
3. A detail shot (wheel, badge, interior)
4. A motion blur / rolling shot
5. A sunset / golden-hour lifestyle
6. A dealership/showroom context shot
