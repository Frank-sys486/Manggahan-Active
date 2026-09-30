---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: ["src/App.css"]
---

# Daily Scoreboard surface

## Scope and mode

- Primary target: `src/App.jsx`
- Mode: Operate
- Responsive web booking surface for players, with staff navigation present but secondary.

## Audience, job, and action

- A community player needs to compare same-day availability across facilities, choose a slot, and start a reservation confidently.
- The primary action is **Reserve this slot** after choosing an open time.
- The demonstration uses fictional schedule data and does not imply pricing, payment, authentication, or a live backend.

## Chosen direction

- Visual world: Courtline Scheduler.
- Approved composition: `.impeccable/mocks/courtline-daily-scoreboard.png`.
- Memorable moment: the selected time becomes the bright blue center of a sport-specific court lane, then resolves into the fixed booking strip.
- Motion: selection crossfades and the booking strip settles upward once; transitions stay within 150–250ms and respect reduced motion.

## Component grammar

- Corners: mostly square, with 2–6px functional rounding on controls only.
- Lines: 1px court rules and dividers; selected slot receives a 3px light inset ring.
- Elevation: flat fields; the fixed booking strip separates through contrast and a top rule, not shadow.
- Type: condensed athletic display face for dates, facilities, and labels; workhorse sans for descriptions and controls; tabular figures for time.
- Ground: sampled deep green `#0D3C36`; paper `#F5F2E9`; basketball wood `#C9AD7F`; badminton green `#1C5851`; futsal blue `#185A7B`; action blue `#2367D1`; mango `#F6B93B`.

## Visible inventory

| Ingredient | Commitment | Medium |
|---|---|---|
| Top navigation | Brand, Schedule, My reservations, Staff view | Semantic HTML/CSS with inline SVG icons |
| Date scoreboard | Large Sep 28 focal date, arrows, seven-day strip | HTML/CSS; native buttons |
| Facility lanes | Basketball, badminton, and futsal rows with distinct page-scale fields | CSS Grid with authored inline SVG court markings |
| Slot states | Open, Limited, Booked, Selected; status never conveyed by color alone | Native buttons, text, and inline SVG symbols |
| Selected-slot strip | Facility, time, player count, availability, primary action | Sticky semantic HTML/CSS |
| Responsive adaptation | Desktop lanes become horizontally scrollable slot tracks on small screens; booking strip becomes stacked | CSS media queries; no separate mobile app |
| Raster assets | None ship in the React UI; the approved comp remains a design reference only | Accepted omission |

## Unresolved decisions

- Real facility names, operating hours, data, and official brand assets remain replacement items.
- Reservation submission is a front-end demonstration until a backend is supplied.
