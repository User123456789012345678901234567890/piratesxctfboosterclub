# Pirates XC & Track and Field Booster Club — website

Static site. No build step, no dependencies. Open `index.html` or upload the whole
folder to any host (GitHub Pages, Netlify, school web space).

```
index.html        About Us (home)
schedule.html     2026 cross country meet schedule
assets/css/       styles.css — all styling, tokens at the top
assets/js/        main.js (shared UI) · schedule.js (countdown + filters)
assets/img/       logo + banner you supplied, plus derived crops/favicons
```

## Theme

Sampled directly from the crest and banner: black `#07080A`, club maroon `#7C1E1E`
(with `#9A2727` / `#B93636` accents), cream `#F7F1E7`, gold hairline `#C9A25C`.
Type is Cinzel (display) + Barlow / Barlow Condensed (body and labels).
All colors and type scales are CSS variables in `:root` — change them in one place.

## Images

| File | Origin |
| --- | --- |
| `logo.png` | your crest, unchanged |
| `logo-mark.png` | crest with the black background keyed out (used on the site) |
| `hero.jpg` | athlete strips cropped from your banner, stacked — used as the hero background so the banner's own wordmark never sits behind the headline |
| `banner.jpg` | your banner, unchanged, shown full-bleed on the home page |
| `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png` | generated from the crest |

## Before you publish — replace the placeholders

Every one is marked with a `PLACEHOLDER` comment in the HTML.

- **Email address** — `info@piratesboosterclub.org` appears in both pages (CTA buttons + footer).
- **Instagram handle** — `@pirates.xc.tf` in both footers.
- **Board roster** — `#board` in `index.html`: real names and initials.
- **Stat band** — athletes supported / meets / volunteer hours.
- **Budget percentages** — the `--val` numbers in the `#impact` bars.
- **Membership tiers** — names, prices and perks.
- **Club-at-a-glance panel** — founding year, dues, meeting cadence.
- **Whole meet schedule** — dates, courses, start times (see below).

## Updating the schedule

Each meet is one block in `schedule.html`:

```html
<article class="meet" data-date="2026-08-29T07:30" data-type="invite" data-place="Seaside Regional Park">
```

- `data-date` — `YYYY-MM-DDTHH:MM`, 24-hour local time
- `data-type` — `trial` · `invite` · `league` · `champ` (drives the badge and the filters)
- `data-place` — short location shown in the countdown line

Also update the visible `Aug / 29 / Sat` date chip and the `<h3>` name. Everything else is
automatic: past meets dim and get a "Completed" badge, the soonest future meet is flagged
"Up Next" and drives the live countdown, and the filter chip counts recalculate themselves.
Add or delete `<article class="meet">` blocks freely.

## Accessibility & performance notes

- Skip link, semantic landmarks, `aria-current` on the active nav item, `aria-pressed`
  on filter chips, labelled icon-only buttons.
- Every animation is disabled under `prefers-reduced-motion: reduce`; the schedule and all
  copy work with JavaScript off.
- `schedule.html` has a print stylesheet — the "Print / Save PDF" button produces a clean
  one-page season sheet.
