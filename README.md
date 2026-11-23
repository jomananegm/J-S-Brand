# J'S — The Little Treat Brand · Website

A complete, static website for J'S — **Egyptian Arabic first (right-to-left)**, with light English brand touches: home, The Rolls, product pages, Our Story, and Order & FAQ.
It includes an interactive 3D Big Mood Box, a working cart, WhatsApp ordering and the InstaPay steps.
It's plain HTML, CSS and JavaScript, so there is no build step and nothing to install.

## Run it
- **Locally:** open `index.html` in a browser, or run `python3 -m http.server` in this folder and open http://localhost:8000.
- **Go live (free):** drag this folder into Netlify Drop (app.netlify.com/drop). Cloudflare Pages, Vercel and GitHub Pages also work.
  Upload the whole folder, not only `index.html`.

## What to edit (owner)
Everything you need to change is in **`js/config.js`**:

| Setting | What it does |
|---|---|
| `JS_PRODUCTS[0].price` | Big Mood Box price — **450** EGP, delivery included (`deliveryIncluded: true`) |
| `social.instagramUrl` | Paste the exact Instagram profile link. Until then the footer shows "Link coming soon". |
| `delivery.areas` | A list of areas turns the area field into a dropdown. If it's empty, customers type their area. |
| `delivery.eta` | Delivery time text. Only set this if you can promise it. |
| `delivery.pickup` | Pickup text, if you offer pickup. |
| `launch.deadline` / `launch.limitedQuantity` | Shows a countdown or "Only N boxes" in The First Drop section. Only use real values. |
| `founder.photo` / `founder.bio` / `founder.nameAr` | Jana's real photo, her own words, and how her name is spelled in Arabic. |
| `photos.*` | Product photos. The roll photos are already set. Add real box photos (`boxOpen`, `boxTop`…) to replace the 3D renders. |
| `details.allergens` / `details.ingredients` | Shown on the product page and in the FAQ. |
| Classic roll `price` + `availability: "available"` | Start selling single rolls. |
| `showSetupNotice: false` | Hides the "Owner setup" reminder before launch. |

To add a product, copy a product object in `JS_PRODUCTS`.
The menu, cart, checkout and WhatsApp message pick it up automatically.

## How ordering works (honest by design)
1. The customer adds boxes. The cart is saved in their browser.
2. They fill in their name, phone, Alexandria area and address. Mood, gift and notes are optional. All required fields are validated.
3. **Continue on WhatsApp** opens `wa.me/201284184425` with the full order already typed in.
4. The order is a **request** until J'S confirms it. The site never says an order is confirmed or paid.
5. The InstaPay number (01284184425) appears only after the customer taps "J'S confirmed my order".
   Every payment is checked by hand.

No database: orders exist only as WhatsApp messages.

## Folders
```
index.html            all pages (switched with #home, #rolls, #big-mood-box, #story, #order)
css/styles.css        design system + all styles
js/config.js          ← owner settings, products, categories
js/box3d.js           the 3D Big Mood Box (pure CSS 3D, no libraries)
js/app.js             cart, checkout, WhatsApp message, split calculator, drizzle game, routing
assets/brand/         logo files (SVG), seal, favicon, app icons
assets/illustrations/ cinnamon roll illustrations (SVG)
assets/images/        3D product renders (WebP) + social share image (og-image.png)
docs/                 brand guide, copy deck (EN + عامية), research notes, photo prompts
tools/                scripts that regenerate the logos and renders
```

## Regenerating brand assets (optional)
`node tools/gen-brand.mjs` rebuilds the logos and roll illustrations.
`python3 tools/render.py` re-renders the product images. It needs Playwright with Chromium and Pillow.

## Notes
- Fonts load from Google Fonts: Lilita One, Poppins, Baloo Bhaijaan 2 (playful Egyptian Arabic), Amiri and IBM Plex Sans Arabic.
- To add more motion: put a new animated WebP in `assets/photos/` and add it to `MEDIA` in `js/app.js`. For a new slider moment, add numbered frames in `assets/frames/`.
- Before launch, replace the relative `og:image` in `index.html` with your full domain URL, e.g. `https://yourdomain.com/assets/images/og-image.png`.
- Accessibility features: keyboard support (the 3D box turns with the arrow keys and opens with Enter), visible focus states, reduced-motion support, labelled form errors, and 44px+ tap targets.
