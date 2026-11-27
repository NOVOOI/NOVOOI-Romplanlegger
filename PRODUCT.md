# Product

<!-- impeccable:product-schema 1 -->

> Written 2026-11-27 from repository evidence. The init interview went unanswered, so facts marked *(inferred)* still need confirmation from NOVOOI.

## Platform

web

## Users

- *(inferred)* Primary: NOVOOI showroom and sales staff who plan a room with or for a customer. They import or draw the floor plan, place NOVOOI products, choose variants and materials, then hand over a shopping list, image export or share link.
- *(inferred)* Secondary: customers who receive a share link or plan on their own later.
- Interface language is Norwegian (bokmål). Product names, brand names and supplier material names are kept in their original form.

## Product Purpose

NOVOOI Romplanlegger lets a user build a room in 2D and 3D and furnish it with the products NOVOOI actually sells. It uses the real models, real WooCommerce variants and prices, and real supplier materials. The planned room becomes a priced shopping list linked to novooi.com. Success means a customer sees their own room with the right products in the right finish, and leaves with a list they can buy.

## Positioning

The catalogue is NOVOOI's own product library: a shared Google Drive folder of supplier 3D files, matched by product ID to live webshop data. Variants, materials and prices in the planner are the shop's real ones. Materials without a verified sample are shown neutrally and never get an invented colour.

## Operating Context

- Desktop browser first *(inferred)*, often in a showroom next to a customer. A phone layout exists (`public/mobile.css`).
- Main workflow: name the plan, then draw or import the room (walls, interior walls, doors, windows, floors, CAD/DWG/SKP/IFC import), then switch between 2D and 3D, place products from the catalogue (tabs Møbler / Drive / I rommet), adjust variants, materials and measurements on the selected object, and check the shopping list (Handleliste). From there the user saves locally or to the cloud, shares a link, or exports an image.
- Deployed on Cloudflare Workers with R2. A GitHub Pages build runs without the backend.

## Capabilities and Constraints

- A single-page app in `public/planner.html` (Three.js, no framework). Styles are layered: inline blocks, then `polish.css`, `mobile.css`, `brand.css`.
- Every user-facing change gets a dated release note in `openSettings()` → Versjonshistorikk, and a version bump in `package.json` and `package-lock.json` (see AGENTS.md).
- A light theme exists, and a dark theme hook (`data-theme`) is present.
- Tests in `tests/*.test.mjs` assert on planner markup and behaviour. Element IDs and classes the tests use must keep working.
- Not built: personal user accounts, stock levels, price guarantees beyond the public Store API.

## Brand Commitments

- Name: **novooi**, written in lowercase in the logo (`public/novooi-logo.svg`).
- Fonts are supplied by NOVOOI: **Season Sans** for the whole interface and **Gazpacho** for H1 only. *(Inferred to be binding: the README states it as a rule.)*
- The favicon carries a small yellow dot, #EEFC9B, to tell the planner apart from the webshop.
- Voice: plain, calm Norwegian. Say what happened and what to do next.

## Evidence on Hand

- Real product models, webshop data and supplier textures: Kvadrat Vidar 0333, walnut, and Poly Haven CC0 wood references.
- Screenshots of earlier releases in `../../artifacts/`.
- No testimonials, customer counts or performance claims exist. None should be written.

## Product Principles

1. The room and the products are the subject. The interface should step back while someone is placing furniture.
2. Show only verified truth: real prices, real variants, and neutral fallbacks instead of invented finishes.
3. It should work with a customer watching: clear state, no developer noise, and nothing that looks broken.
4. Stay fast and stable. Toolbars must not jump, and a panel must not reflow while someone is working.

## Accessibility & Inclusion

Keyboard focus is visible on all controls. Touch targets are at least 44 px on phone. Contrast meets WCAG AA for text and controls.
