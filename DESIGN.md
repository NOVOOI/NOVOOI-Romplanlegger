---
name: NOVOOI Romplanlegger
description: The room published as a plate in a Nordic architecture journal.
colors:
  ink: "#17191A"
  ink-raised: "#2B2E2F"
  ink-rule: "#3A3E3F"
  stone-plate: "#E4E6E1"
  page-white: "#FAFAF8"
  page-shade: "#EEEFEB"
  spot: "#EEFC9B"
  spot-pressed: "#E3F28A"
  spot-tint: "#F4F8DD"
  graphite-muted: "#4C504A"
  on-ink-muted: "#BFC3BC"
  hairline: "#CDD0C9"
  metre-grid: "#B3B8AE"
  danger: "#A8261C"
  warn: "#8A5A00"
typography:
  plate-title:
    fontFamily: "Gazpacho, Season Sans, serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Season Sans, sans-serif"
    fontSize: "20px"
    fontWeight: 600
  title:
    fontFamily: "Season Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 500
  body:
    fontFamily: "Season Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  label:
    fontFamily: "Season Sans, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0em"
  key-number:
    fontFamily: "Season Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    fontFeature: "tnum"
rounded:
  hair: "2px"
  plate: "4px"
  dialog: "6px"
  round: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page-white}"
    typography: "{typography.body}"
    rounded: "{rounded.plate}"
    padding: "8px 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.ink-raised}"
  button-ghost:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "8px 14px"
    height: "36px"
  button-save:
    backgroundColor: "{colors.spot}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
  button-save-hover:
    backgroundColor: "{colors.spot-pressed}"
  icon-button:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "7px 10px"
    height: "36px"
  icon-button-active:
    backgroundColor: "{colors.spot}"
    textColor: "{colors.ink}"
  input-text:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
  tab-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page-white}"
    typography: "{typography.body}"
    padding: "14px 6px"
  masthead:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page-white}"
  key-marker:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink}"
    typography: "{typography.key-number}"
    rounded: "{rounded.round}"
    size: "24px"
  key-marker-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.spot}"
  key-row-selected:
    backgroundColor: "{colors.spot-tint}"
  totals-footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page-white}"
    height: "48px"
    padding: "0 16px"
---

# Design System: NOVOOI Romplanlegger

## Overview

**Creative North Star: "Planplansje"**

The room is published as a plate in a Nordic architecture journal. An ink masthead sits over a cool stone plate; the plan is drawn on it with solid ink poché walls and a hairline metre grid; a page-white side page on the right carries the catalogue, the numbered key and the totals, separated by ink rules. The interface is a two-value world, ink and paper, and the single NOVOOI spot yellow marks only what is chosen or what saves.

Density is that of a printed plate key: fixed type steps, tabular numbers, rules instead of cards. The plan itself is the subject; chrome steps back to outlined ink controls. This world deliberately replaces the incumbent white floating panels with soft shadows and a blue highlight.

**Key Characteristics:**
- Two values (ink #17191A and page-white / stone) plus one spot (#EEFC9B).
- 1px ink rules divide docked surfaces; shadow is reserved for things that float.
- 4px corners on every control and surface.
- Four fixed type steps (11/13/15/20) in Season Sans; Gazpacho only for the plate title.
- Numbered key markers on the plan matched to numbered rows in the I rommet list.

## Colors

An ink-and-stone palette with one acid-pale spot, applied like a two-colour print job.

### Primary
- **Ink** (`ink`): masthead, poché walls (`--cap`), primary buttons, pressed tabs and segmented controls, focus rings, rules between docked regions, the totals footer, the 3D selection outline (`--accent`).
- **Ink Raised** (`ink-raised`): hover on ink buttons and pressed masthead buttons.
- **Ink Rule** (`ink-rule`): dividers inside the masthead.

### Secondary
- **NOVOOI Spot** (`spot`): the save action (Lagre), active stage tools, the selected key marker's number, the selected key-row badge, view badge, phone nav active tab, text selection, the masthead wordmark dot. Hover is **Spot Pressed** (`spot-pressed`).
- **Spot Tint** (`spot-tint`): background of the selected row in the key list.

### Neutral
- **Stone Plate** (`stone-plate`): page and stage ground; the 3D scene background reads it through `applyTheme()`.
- **Page White** (`page-white`): side page, popovers, inputs, outlined buttons, text on ink.
- **Page Shade** (`page-shade`): hover rows, notes, product photo wells.
- **Graphite Muted** (`graphite-muted`): secondary text, labels, counts.
- **On-Ink Muted** (`on-ink-muted`): save state and secondary text on the masthead.
- **Hairline** (`hairline`): resting borders on controls, cards and list rows.
- **Metre Grid** (`metre-grid`): the world-space metre grid on the plate (`--grid`) and scrollbars.
- **Danger** (`danger`) / **Warn** (`warn`): destructive actions and warnings only.

### Named Rules
**The One Spot Rule.** The spot yellow means "chosen" or "save". It never fills a panel, a heading or decoration; if nothing is selected and nothing is unsaved, the only spot on screen is the wordmark dot and the Lagre button.

**The Two-Value Rule.** Everything else is ink on paper or paper on ink. A pressed state inverts to ink; it does not introduce a new hue.

## Typography

**Display Font:** Gazpacho (with Season Sans fallback), H1 only
**Body Font:** Season Sans (with sans-serif fallback)

**Character:** A literary serif title over a plain, workmanlike grotesk, like a plate caption over a drawing key.

### Hierarchy
- **Plate title** (400, 28px, 1.1, -0.01em): the room name in the plate caption, bottom left of the stage. Hidden on phone.
- **Headline** (600, 20px): side-page headings (I rommet, product title, dialog titles).
- **Title** (500-600, 15px): plan name in the masthead, price, start-option buttons.
- **Body** (400-600, 13px): default text, buttons, tabs, caption figures.
- **Label** (600, 11px, no tracking, sentence case): field labels, brand lines, counts, save state.
- **Key number** (700, 12px, tabular): numerals inside key markers and key badges.

### Named Rules
**The Four Steps Rule.** Interface text uses only 11, 13, 15 and 20px (`--t-xs/s/m/l`). The 28px plate title and 12px key numbers are the only exceptions.

**The One Serif Rule.** Gazpacho appears on the H1 `.plate-title` and nowhere else.

**The Sentence-Case Rule.** No uppercase or letter-spaced labels; labels are sentence case at 11px, weight 600, in graphite.

**The Tabular Figures Rule.** Areas, heights, prices, counts and key numbers use tabular numerals; totals align right.

## Layout

Desktop: an ink masthead across the top, the stage filling the remaining space, and a 344px side page (320px between 781 and 1100px) flush to the right edge behind a 1px ink rule. The stage carries a 2D/3D segmented control top left, a square tool stack top right, and the plate caption (title, area, ceiling height) bottom left as plain text on the stone, not a chip. The room-editing panel floats over the stage at left (300px) rather than resizing it.

Phone (≤780px): a 64px ink masthead with the plan title only, a full-bleed stage, a 64px four-tab bottom nav with an ink top rule, and the side page as a bottom sheet. Tools collapse into a Verktøy menu. Touch targets are 44px.

Spacing rhythm is 4 / 8 / 12 / 16px; side-page body padding is 16px; controls are 36px tall (40px under 600px, 44px on phone).

## Elevation & Depth

Depth comes from rules and value, not shadow. Docked surfaces (masthead, side page, tabs, key list, totals footer) are flat and divided by 1px ink rules. A single lift shadow is used for surfaces that float over the plate: popovers, menus, the selection bar, the floating room panel and tool panels, always together with a 1px ink border. Dialogs and the tour card get a deeper shadow over a 50% ink scrim.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 8px 24px rgba(23,25,26,.14)`): floating panels, header menu, selection bar.
- **Dialog** (`box-shadow: 0 24px 60px rgba(23,25,26,.28)`): modal dialogs.
- **Marker seat** (`box-shadow: 0 1px 3px rgba(23,25,26,.22)`): key markers, so they read over flooring textures.

### Named Rules
**The Rules-Not-Shadows Rule.** If a surface is docked, it gets an ink rule and no shadow. Shadow means "this floats over the plate".

## Shapes

Gently squared corners (4px) on every control, card, input, popover and the side page; 2px on thumbnails and photo wells; 6px on dialogs and the tour card. Key markers, key badges and wall handles are perfect circles. Selected swatches draw a 2px ink frame inside their own edge. Borders are 1px; key markers use 1.5px; wall handles 2.5px.

## Components

### Buttons
- **Shape:** gently squared (4px), 36px tall.
- **Primary:** ink fill, page-white text, 13px weight 600, no uppercase; hover to ink-raised.
- **Ghost:** page-white fill, hairline border; hover turns the border ink.
- **Save:** spot fill, ink text, the only spot button.
- **Danger:** danger fill.
- **Focus:** 2px ink outline, 2px offset (spot on the masthead).

### Icon buttons
Page-white with a hairline border and an 18px stroke icon; border goes ink on hover. Active or expanded stage tools fill with spot and get an ink border. On the masthead they are transparent with a grey outline and page-white icon.

### Segmented controls and tabs
The 2D/3D control is a page-white strip in a 1px ink frame; the pressed segment inverts to ink. Side-page tabs share the same inversion, with a 1px ink rule under the tab bar.

### Inputs / Fields
Page-white, hairline border, 4px corner; focus turns the border ink. Labels are 11px graphite.

### Cards / Containers
Catalogue cards and product families: page-white, hairline border, 4px corner, no shadow, no lift on hover; hover turns the border ink.

### Navigation
Ink masthead: lowercase novooi wordmark inverted to white with a spot dot, a vertical ink-rule divider, the plan title at 15px, save state at 11px muted. Phone bottom nav: page-white with ink top rule; active tab fills spot.

### Key markers and the key list (signature)
In 2D, every placed product carries a 24px circular marker with its number (page-white, 1.5px ink ring, 12px bold tabular). The selected marker inverts to ink with a spot numeral. The I rommet list repeats the same numbers in matching key badges; rows are ruled with hairlines under a 1px ink top rule, the selected row tints spot-tint and its badge fills spot. Row actions appear only for the selected or focused row.

### Totals footer
A 48px ink bar at the foot of the side page: "Handleliste" left, the count in spot at the right in tabular figures.

## Do's and Don'ts

### Do:
- **Do** separate docked regions with 1px ink rules (#17191A) and keep them shadowless.
- **Do** keep every interface size on the 11/13/15/20px steps.
- **Do** invert pressed states to ink with page-white text.
- **Do** read the canvas colours from `--stage`, `--cap`, `--accent` and `--grid` so the plan and the chrome stay one print job.
- **Do** number every placed product on the plan and in the key list with the same circular badge.
- **Do** use tabular figures for measures, prices and counts.

### Don't:
- **Don't** use the spot yellow for anything except selection, the save action, active tools and key markers.
- **Don't** set Gazpacho anywhere but the plate title H1.
- **Don't** use uppercase or tracked-out labels.
- **Don't** round corners beyond 4px on controls and panels (6px on dialogs only).
- **Don't** put a shadow on a docked surface or a card hover.
- **Don't** reintroduce a blue highlight or blue measurement lines.
