# Tungsten Learn — UI Rules

## Identity
- Product name: Tungsten Learn
- Personality: Premium academic tool. Editorial, trustworthy, focused. Not a startup, not a toy.

## Fonts
- Use Lexend exclusively (import from Google Fonts)
- Display/Hero: 3rem–3.75rem, weight 900, letter-spacing -0.035em
- Section headlines: 1.5rem–1.875rem, weight 800
- Body text: 1rem–1.125rem, weight 400, line-height 1.65
- Labels & captions: 0.75rem–0.875rem, weight 700, uppercase, letter-spacing 0.07em
- Never use Inter, Roboto, system-ui, or Arial

## Colors
- Primary: #2111d4 (Tungsten Indigo)
- Primary tints: /10, /20, /50 opacity variants for backgrounds, borders, glows
- Surface hierarchy:
  - Cards / inputs: #ffffff
  - Page background: #f6f6f8
  - Hover / accent fills: #f0f0f5
- Body text: #0d0d1f (never pure black)
- Muted text: #44446a
- Faint/placeholder: #8888aa
- Borders: #e2e4ed default; rgba(33,17,212,0.2) for primary-tinted borders

## No-Line Rule
- Do NOT use 1px solid gray borders to divide sections
- Use background color transitions (#fff → #f6f6f8) as dividers instead
- If a border is truly necessary, use rgba(33,17,212,0.1) only

## Navigation
- Sticky top nav
- Background: rgba(246,246,248,0.82) with backdrop-filter: blur(20px) saturate(1.5)
- Height: 64–66px
- Logo: square rounded mark (border-radius 9px) in #2111d4 + wordmark "Tungsten" in slate-900 + "Learn" in #2111d4
- Nav links: font-size 0.855rem, weight 500, no underline, hover → background rgba(33,17,212,0.1) + color #2111d4
- Active link: same as hover, persistent
- Right side: optional "Beta" badge (uppercase, 0.68rem, weight 800, #2111d4 on rgba(33,17,212,0.1) pill) + primary CTA button

## Buttons
- Primary: background #2111d4, color #fff, border-radius 12px, weight 700, box-shadow 0 6px 24px rgba(33,17,212,0.2)
  - Hover: background #4a3aff, translateY(-2px), stronger shadow
  - Active: scale(0.95)
- Ghost/secondary: transparent bg, 1.5px solid #e2e4ed border, border-radius 12px
  - Hover: border-color rgba(33,17,212,0.5), color #2111d4, background rgba(33,17,212,0.05)
- All transitions: 250ms cubic-bezier(0.22, 1, 0.36, 1)
- Never mix border-radius values — pick one and keep it consistent throughout the UI

## Inputs
- Background: #f8f8fc (slate-50 equivalent)
- Border: 1.5px solid #e2e4ed
- Border-radius: 12px (same as buttons — never mix)
- Focus ring: 2px solid #2111d4, background #fff
- Transition: 200ms

## Cards
- Background: #ffffff
- Default border: 1px solid #e2e4ed
- Border-radius: 16px (larger than buttons — cards are containers)
- Hover: border-color rgba(33,17,212,0.5), box-shadow 0 8px 32px rgba(33,17,212,0.1)
- Transition: 250ms cubic-bezier(0.22, 1, 0.36, 1)
- Shadows use primary-tinted blur: rgba(33,17,212,0.12) not plain black

## Badges & Pills
- Shape: border-radius 999px
- Text: uppercase, weight 800, font-size 0.68rem–0.72rem, letter-spacing 0.07em
- Default style: background rgba(33,17,212,0.1), color #2111d4, border 1px solid rgba(33,17,212,0.2)
- Use for: status labels, subject tags, "Verified" indicators, feature flags

## Elevation & Shadows
- Level 1 (cards): box-shadow 0 4px 16px rgba(33,17,212,0.08)
- Level 2 (floating elements / badges): box-shadow 0 12px 40px rgba(0,0,0,0.1)
- Level 3 (hero focal point / modal): box-shadow 0 24px 64px rgba(33,17,212,0.12)
- ALL shadows use primary-tinted color, never plain rgba(0,0,0,x)

## Layout
- Max content width: 1180px, centered, padding 0 2rem
- Use intentional asymmetry: overlapping containers, offset badges, unequal grid columns (e.g. 1.05fr 0.95fr)
- Section spacing: padding 4rem–6rem top/bottom
- Never use equal-weight two-column grids — always slightly weight one side
- Float auxiliary UI elements (badges, stat cards) outside their parent container using negative margins or absolute positioning

## Typography Rules
- Never use pure black (#000000) for text
- No more than 3 type sizes in a single section
- Maintain strict visual hierarchy: one display size, one headline size, one body size per section
- Line-length cap: 60–65ch for body text
- Headings: tight tracking (-0.02em to -0.035em)

## Motion
- All interactive elements: transition 250ms cubic-bezier(0.22, 1, 0.36, 1)
- Hover lifts (cards, buttons): translateY(-1px) to translateY(-2px), never more
- Click/active: scale(0.95) — always, on every clickable element
- Entrance animations: staggered fade + translateY(16px) → translateY(0), delay 80ms per element
- Nothing moves without a reason; no decorative looping animations except subtle pulse on status dots

## Anti-AI Patterns (Do NOT do these)
- No purple gradient hero sections
- No generic "rocket ship" or "lightbulb" emoji in headlines
- No three-column feature grids with centered icons and two-line descriptions
- No "Get started for free" as the only CTA copy
- No full-bleed hero images with white text overlay
- No floating 3D objects or isometric illustrations
- No rainbow icon sets (one color system only)
- No excessive glassmorphism on every element — reserve blur for the nav only
- No card grids where every card is identical in size and weight
- Use whitespace as a design element, not filler


## Typography

### Font Stack (4 roles, all from Google Fonts)

--font-display: 'Syne', sans-serif;
--font-ui: 'Lexend', sans-serif;
--font-reading: 'Lora', serif;
--font-mono: 'DM Mono', monospace;

Import all four:
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Lexend:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');

---

### Syne — Display & Hero (var(--font-display))
Used for: hero headlines, section titles, profile display names, trending topic headers
- Font is geometric and punchy — it signals "this is a place with a point of view"
- Weight 800 only for headlines; weight 700 for sub-display
- Size range: 2.5rem–4.5rem for hero; 1.5rem–2rem for section headers
- Letter-spacing: -0.03em to -0.04em (always tight)
- Line-height: 1.02–1.08 (very tight on large sizes)
- Never use below 1.25rem — it loses its character at small sizes
- Use for: "What are you learning today?" hero, leaderboard titles, subject category headers

---

### Lexend — UI Shell (var(--font-ui))
Used for: navigation, buttons, labels, badges, input fields, tab bars, tooltips, metadata rows
- The workhorse. Optimized for reading efficiency at small sizes
- Weight 400 for body metadata (timestamps, view counts)
- Weight 500 for nav links, secondary labels
- Weight 600–700 for buttons, active states
- Weight 800–900 for badge text, pill labels, stat numbers
- Size range: 0.68rem (badges) to 1rem (nav links)
- Letter-spacing: 0 for body use; +0.06em to +0.09em for uppercase labels
- Line-height: 1.4 for UI elements (compact)

---

### Lora — Feed & Long-Form Reading (var(--font-reading))
Used for: post body text, study note content, article previews, comment threads, course descriptions
- Serif creates the "academic journal" feel inside the social feed
- Makes reading dense study content feel intentional, not like a tweet
- Weight 400 for all body text
- Weight 600 for pull quotes or highlighted excerpts
- Italic (weight 400) for quotations, citations, and definitions
- Size range: 1rem–1.125rem for feed posts; 1.175rem–1.375rem for long-form articles
- Line-height: 1.7–1.8 (generous — this is reading content)
- Letter-spacing: 0 (never touch tracking on a serif at body size)
- Max line-length: 62ch — hard cap, enforce with max-width on text containers
- Never use Lora for UI chrome — it belongs only inside content cards

---

### DM Mono — Code & Technical Content (var(--font-mono))
Used for: code snippets in posts, math formulas, keyboard shortcuts, data tables, file names
- Weight 400 for inline code, weight 500 for code block content
- Italic for comments inside code blocks
- Size: always 0.9em relative to its parent (slightly smaller than surrounding text)
- Background: rgba(33,17,212,0.07), padding 2px 6px, border-radius 5px for inline
- For code blocks: background #f0f0f5, padding 1.25rem, border-radius 12px, border-left 3px solid #2111d4

---

### Hierarchy Rules (strict)

Page Hero:
  Syne 800, 3.5rem–4.5rem, -0.04em tracking

Section Title:
  Syne 700, 1.75rem–2.25rem, -0.03em tracking

Feed Post Username:
  Lexend 700, 0.92rem, -0.01em tracking, color #0d0d1f

Feed Post Timestamp / Metadata:
  Lexend 400, 0.78rem, color #8888aa

Feed Post Body:
  Lora 400, 1.05rem, line-height 1.75

Post Highlight / Pull Quote:
  Lora 600 italic, 1.1rem, border-left 3px solid #2111d4, padding-left 1rem

Subject Badge / Tag Label:
  Lexend 800, 0.68rem, uppercase, letter-spacing 0.08em

Button Text:
  Lexend 700, 0.875rem, letter-spacing -0.01em

Inline Code:
  DM Mono 400, 0.9em, background rgba(33,17,212,0.07)

Stat / Number Display (e.g. "12.4k learners"):
  Lexend 900, 1.75rem–2.5rem, letter-spacing -0.03em

Caption / Helper Text:
  Lexend 400, 0.78rem, color #8888aa, line-height 1.5

---

### Pairing Logic
- Syne + Lora = tension between editorial authority and academic warmth
- Lexend bridges them — neutral enough to not fight either
- DM Mono appears sparingly — its presence signals "this is a serious learning tool"
- Never use Syne and Lora in the same text element
- Never use more than 3 of the 4 fonts in a single visible section

