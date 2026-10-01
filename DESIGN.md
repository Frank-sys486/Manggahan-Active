---
name: Manggahan Active
description: A modern community-sports system shaped like a clear, energetic court scheduler.
colors:
  court-green: "#0d3c36"
  court-green-deep: "#082f2b"
  score-paper: "#f5f2e9"
  bright-paper: "#fffdf8"
  deep-ink: "#092f35"
  soft-ink: "#3e5c5d"
  mango-marker: "#f6b93b"
  action-blue: "#2367d1"
  action-blue-deep: "#174ea9"
  basketball-wood: "#c9ad7f"
  badminton-green: "#1c5851"
  table-tennis-blue: "#185a7b"
  volleyball-clay: "#8a4b35"
  tennis-green: "#3b6f4d"
  pickleball-orange: "#a6632e"
  available-green: "#14874e"
  limited-amber: "#996200"
  booked-red: "#b8253b"
  rule-line: "rgba(9, 47, 53, 0.26)"
  focus-blue: "#7bb4ff"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(3rem, 7vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.84
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.24rem"
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.3
  label:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.13em"
rounded:
  field: "3px"
  control: "4px"
  status: "50%"
  pill: "999px"
spacing:
  hairline: "4px"
  compact: "8px"
  control: "12px"
  base: "16px"
  cluster: "24px"
  section: "28px"
  frame: "32px"
components:
  button-primary:
    backgroundColor: "{colors.action-blue}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.action-blue-deep}"
    textColor: "#ffffff"
  field:
    backgroundColor: "{colors.bright-paper}"
    textColor: "{colors.deep-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0 12px"
    height: "46px"
  slot-selected:
    backgroundColor: "{colors.action-blue}"
    textColor: "#ffffff"
    typography: "{typography.body}"
  badge-confirmed:
    backgroundColor: "#d9f4df"
    textColor: "#07572f"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "36px"
  badge-pending:
    backgroundColor: "#fff0bd"
    textColor: "#684600"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "36px"
---

# Design System: Manggahan Active

## Overview

**Creative North Star: "Courtline Scheduler"**

Manggahan Active should feel like a community facility timetable drawn directly onto the playing surface: energetic, legible, and ready for action. Deep court green and warm score-sheet paper establish the system; sport-surface colors identify context, while action blue and mango are reserved for selection, direction, and active emphasis.

The system is operational rather than decorative. Strong horizontal bands, court-rule dividers, condensed athletic headings, and clear state symbols make dense availability easy to scan. Its friendliness comes from warm paper, vivid markers, direct language, and accessible controls—not soft cards or ornamental illustration.

The Courtline Scheduler is a reusable component grammar, not a mandate to reuse the Daily Scoreboard page composition. New surfaces may change their arrangement while preserving the same palette roles, typography, linework, state vocabulary, and action hierarchy. The Daily Scoreboard's exact first viewport and lane composition remain defined only in its surface brief.

**Key Characteristics:**

- Flat, full-width operational bands separated by rules and contrast.
- Condensed uppercase display type paired with a practical sans-serif body.
- Sport surfaces and authored line markings used as functional context.
- One bright blue primary action or selection focus at a time.
- Mostly square geometry with small functional radii on controls.
- Availability communicated through symbol, label, and color together.

## Colors

The palette combines civic deep green and warm paper with sport-specific field colors, then uses blue and mango as scarce, unmistakable action signals.

### Primary

- **Court Green:** The structural brand ground for navigation, operational rails, summaries, and high-contrast dark bands.
- **Action Blue:** The sole primary-action and selected-state fill. Its deeper partner is the hover state.

### Secondary

- **Mango Marker:** A compact active accent for brand punctuation, active rules, labels, and scrollbar thumbs; it should not become a large background.
- **Basketball Wood, Badminton Green, Table Tennis Blue, Volleyball Clay, Tennis Green, and Pickleball Orange:** Context colors for sport surfaces and facility identity, not interchangeable decoration.

### Tertiary

- **Available Green, Limited Amber, and Booked Red:** Semantic availability colors. Always pair them with the circle, triangle, or crossed-circle mark and a text label.

### Neutral

- **Score Paper:** The default page ground and light structural surface.
- **Bright Paper:** The cleaner field surface used inside inputs.
- **Deep Ink:** Primary copy, borders, and icons on light ground.
- **Soft Ink:** Secondary and explanatory copy.
- **Rule Line:** The default translucent divider on paper.

**The One Blue Rule.** Action blue identifies the current selection or the one primary action; do not scatter it across unrelated decoration.

**The Triple-Coded Status Rule.** Availability is never color-only: every state requires its established symbol and a readable label.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow and sans-serif fallbacks)  
**Body Font:** Barlow (with system-ui and sans-serif fallbacks)

**Character:** The pairing feels athletic without becoming a sports-poster caricature. Barlow Condensed carries compact, forceful headings and schedule labels; Barlow keeps instructions, controls, and dense operational data calm and readable.

### Hierarchy

- **Display** (800, fluid 3–6rem, 0.84 line height): Major view titles and rare numeric focal points; uppercase with tight tracking.
- **Headline** (800, 2rem, 0.88 line height): Facility names and section anchors; uppercase and compact.
- **Title** (700, about 1.24rem, 1 line height): Booking facts, dates, and strong values inside operational rails.
- **Body** (400–600, 1rem, about 1.3 line height): Instructions, controls, supporting descriptions, and table content.
- **Label** (600–700, about 0.72rem, 1 line height): Eyebrows, metadata, and utility labels; uppercase with generous tracking.

Use tabular numerals for schedules, time values, references, and other aligned operational data. Reserve tight negative tracking for large condensed headings; body copy uses normal spacing.

**The Two-Voice Rule.** Condensed type announces; body type explains and controls. Do not set paragraphs or form values in the display face.

## Layout

Use full-width bands and explicit grid relationships rather than floating card collections. Core operational areas align to a 32px desktop frame, commonly step down to 20px at tablet widths, and use a 16px mobile frame. Repeated gaps come from the compact 8–16px range inside controls, the 24–28px range between clusters, and 32px for major framing.

Dense scheduler components may keep a deliberate minimum width and become horizontally scrollable on small screens. Preserve the row headers or other orientation cues while scrolling whenever practical. At or below 1100px, simplify multi-column support content; at or below 760px, stack navigation and forms, provide full-width primary actions, and retain at least 44px touch targets.

Use CSS Grid for timetable and summary relationships, Flexbox for compact control groups, and semantic tables for staff-oriented tabular data. Page-specific sequencing—especially the Daily Scoreboard's date board, facility lanes, and selected-slot strip—belongs to that surface brief and is not a global layout template.

**The Bands, Not Cards Rule.** Build operational hierarchy with aligned fields, rails, borders, and contrasting surfaces before introducing a contained card.

## Elevation & Depth

The system is intentionally flat. Separation comes from color fields, 1px dividers, strong top rules, and occasional inset strokes rather than ambient drop shadows. Selected schedule cells use a light 4px inset ring; sticky booking surfaces use a 3px mango top rule.

The only existing drop shadow is a narrow directional shadow used when a sticky facility label overlays horizontally scrolling content on mobile. Treat it as structural wayfinding, not a general elevation token.

Motion is short and state-based: slot transitions run at 180ms ease-out, and the reservation-detail rail settles upward once over 240ms with a strong deceleration curve. Reduced-motion preferences collapse animations and transitions to effectively instant feedback.

**The Rule Before Shadow Rule.** Use a border, surface change, or inset line to explain hierarchy. Add a shadow only when overlap must be spatially legible.

## Shapes

The default geometry is square and field-like. Major bands, facility surfaces, summaries, navigation, and tables have no rounded container corners. Functional controls use restrained 3–4px rounding; only semantic badges use the pill radius, while circular status marks remain true circles.

Rules are part of the identity: use 1px dividers for grid structure, 2px section rules for view boundaries, 3px emphasis rails, and 4px inset selection rings. Inline icons use open, rounded linework, while authored sport marks and court diagrams use consistent strokes rather than filled clip art.

**The Functional Radius Rule.** Round a shape only when it communicates a control, status, or circular symbol; never soften a structural panel merely to make it friendlier.

## Components

### Primary Button

- Bright action-blue fill, white text and border, minimum 52px height, 24px horizontal padding, 4px radius, and bold body type.
- Hover shifts to deep action blue; active presses downward by 1px; focus uses the global 3px focus-blue outline with a 3px offset.
- Use for the single next action in a surface or operational region.

### Text Button

- Transparent, borderless, at least 44px high, bold, and underlined with a 4px offset.
- Use for back, browse, and other secondary actions. It inherits the surrounding text color rather than competing with the primary button.

### Navigation

- Place navigation on court green with paper-colored icon-and-label buttons.
- Desktop items align to the full 76px bar height. Hover adds a restrained translucent white field; active navigation turns mango and gains a 4px mango bottom rule.
- On small screens, navigation becomes a horizontally scrollable 54px-high row beneath the brand. Never hide destinations in an unlabeled custom icon menu when the row can scroll.

### Inputs / Fields

- Bright-paper fill, deep-ink text, 46px minimum height, 12px horizontal padding, a transparent 1px border, and 3px radius.
- Labels sit above fields in compact bold body type. Use the global focus-visible outline for keyboard clarity.
- Disabled controls must keep their native non-interactive behavior and cursor; errors need explicit text in addition to any color treatment.

### Login and Role Selection

- The login surface inherits the Courtline Scheduler world: court-green environmental field, score-paper form field, mango active rule, and one action-blue submit button.
- Role choices are native radio inputs presented as square operational controls, with icon, role name, and short access description. Checked state uses court green plus a mango inset rule.
- Demo credentials remain visibly labeled as classroom-only data. Authentication errors appear beside the form with a direct recovery instruction; password visibility uses a labeled vector-icon control.

### Status Badge

- Compact 36px-high pills are appropriate for confirmed or pending records outside the scheduler.
- Each badge pairs readable semantic text with its own foreground, pale background, and 1px border. Do not use badges as decorative category chips.

### Courtline Scheduler

- A facility lane combines a light identifying header with a sport-colored track and authored court markings behind the interactive slots.
- Each slot is a native button with a 1px vertical rule, at least a 44px target, a status mark, a status word, and a time range. Hover is a translucent light wash; booked is disabled; selected becomes action blue with white type and a 4px score-paper inset ring.
- Status marks have fixed grammar: outlined circle for open, triangle for limited, and a red crossed circle for booked. Adapt their contrast to the underlying field without changing the shape meaning.
- The selection summary is a high-contrast court-green rail with mango emphasis and one action-blue button. It may be sticky when it supports a scheduler, but stickiness and its internal columns are surface decisions rather than universal requirements.

### Operational Rows and Tables

- Reservation rows and staff tables stay flat, using generous vertical padding and 1px rule-line separators.
- Use uppercase condensed titles for the primary record identity, body type for detail, and tabular numerals for codes and times.

## Do's and Don'ts

### Do:

- **Do** preserve court green and score paper as the dominant light/dark relationship.
- **Do** use action blue for the current selection and the one obvious next action.
- **Do** pair every availability color with its established symbol and text label.
- **Do** prefer aligned bands, grids, rules, and sport surfaces for dense operational information.
- **Do** keep controls keyboard-visible, at least 44px tall where interactive, and respectful of reduced motion.
- **Do** let new page compositions vary while retaining the Courtline Scheduler's durable tokens and component grammar.

### Don't:

- **Don't** turn the Daily Scoreboard's exact sequence or first viewport into a mandatory template for every screen.
- **Don't** build generic rounded-card dashboards, floating glass panels, or shadow-heavy card grids.
- **Don't** use mango, sport colors, or semantic status colors as arbitrary decoration.
- **Don't** communicate open, limited, booked, selected, confirmed, or pending with color alone.
- **Don't** use condensed display type for paragraphs, form values, or long instructions.
- **Don't** introduce large corner radii on structural surfaces; 3–4px is the control language, not a suggestion to round everything.
