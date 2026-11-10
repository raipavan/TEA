# TEA

Cup2Eat — **Eat Your Drink!** A customer-facing landing website for edible biscuit cups (chocolate, vanilla, elaichi) sold wholesale at ₹3,999 per 396-cup box, with delivery across India.

## Files

- `index.html` — full landing page (hero, flavours, use cases, sustainability, wholesale order builder, testimonials, FAQ, contact)
- `styles.css` — design system: cream/espresso/forest-green/caramel palette, Fraunces + Karla, responsive layout, reduced-motion support
- `app.js` — live order builder (box calculator, flavour selection, WhatsApp order link), FAQ accordion, poster lightbox, scroll reveals, mobile nav
- `assets/` — product photography cropped from the brand's launch poster

## Run

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

Orders route to WhatsApp / phone: **98181 92575**.