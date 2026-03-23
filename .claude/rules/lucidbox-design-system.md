# LucidBox Design System (Enforcement)
# Path: **/*.css, **/*.tsx, **/*.jsx, **/*.swift, **/tailwind.config.*, **/*.svelte, **/globals.css

Tokens: `LucidBox-LLC/design/tokens/source.json` | Brand: `LucidBox-LLC/design/BRAND-DNA.md` | Sub-brands: `LucidBox-LLC/design/sub-brands.md`

## Color Rules

### Dark Canvas (No Sub-Brand Overrides Allowed)

| Token | Value | Usage |
|-------|-------|-------|
| `canvas-deep` | `#0A0A0A` | Primary background |
| `canvas-elevated` | `#121212` | Cards, elevated surfaces |
| `canvas-subtle` | `#1A1A1A` | Secondary backgrounds |

- Approved range: `#0A0A0A` - `#1A1A1A` (warm undertones only)
- REJECT: `#000000` (pure black) -- always flag, no exceptions
- REJECT: cool-toned blacks (blue/purple undertones outside `#0F1117` - `#1C1B2E` elevated range)

### Warm Cream / Text (No Sub-Brand Overrides Allowed)

| Token | Value | Usage |
|-------|-------|-------|
| `cream-text` | `#F5F5F5` | Primary text on dark |
| `cream-background` | `#F5F0E8` | Light mode canvas |
| `cream-surface` | `#FAFAF9` | Light mode cards |

- Approved text range: `#E8E4DF` - `#F5F5F5`
- REJECT: `#FFFFFF` as background color (acceptable only in `rgba()` glass surfaces)
- REJECT: cool-white text without warmth

### Gold / Accent (Master)

| Token | Value | Usage |
|-------|-------|-------|
| `gold` | `#C9A962` | CTAs, active states, brand indicators |
| `gold-hover` | `#D4AF37` | Hover/pressed states |
| `gold-subtle` | `rgba(201, 169, 98, 0.15)` | Borders, glows, ambient |
| `gold-foreground` | `#1B1409` | Text on gold backgrounds |
| `bronze` | `#8B7355` | Inactive states, warm depth |

### Sub-Brand Accent Overrides (All Approved)

| Sub-Brand | Accent(s) | Family |
|-----------|-----------|--------|
| Tare | `#C9A962` (gold) | Gold |
| Plate & Gather | `#C9A962` (gold) | Gold |
| AsymmetricBridge | `#F4A261` (amber, Terminal) / `#818CF8` (indigo, Observatory) | Gold + Cool |
| Personal Site | `#c4634a` (copper) | Warm |
| Art of Fact | `#e07a5f` (terracotta) | Warm |
| LucidBox Site | `#5E5CE6` (indigo) | Cool |
| PracticePal | `#5E5CE6` (indigo) + `#30B0C7` (teal) | Cool |
| Tutelage | Stone palette only (no accent) | Neutral |

- Before flagging a color: check sub-brand table above AND project-root `BRAND.md` / `DESIGN.md`
- If a value matches any documented override, it is compliant
- REJECT: hardcoded hex not in master palette OR any sub-brand override -- suggest nearest token

### Semantic Status Colors

| Token | Value | Meaning |
|-------|-------|---------|
| `status-positive` | `#10B981` | Safe, confirmed, on-track (range: `#10B981` - `#2A9D8F`) |
| `status-warning` | `#D97706` | Attention needed (range: `#D97706` - `#F4A261`) |
| `status-danger` | `#E63946` | Alert, action required (range: `#E63946` - `#EF4444`) |
| `status-info` | `#7DAF8E` | Informational (alt: `#5E5CE6` for LucidBox/PracticePal) |

### Muted / Supporting
- `muted`: `#9A9A9A` (labels) | `muted-strong`: `#6A6A6A` (disabled)
- `border-default`: `rgba(196, 151, 70, 0.15)` | `border-strong`: `rgba(212, 175, 55, 0.24)` | `border-light`: `rgba(200, 190, 170, 0.4)`

---

## Typography Rules

### Pairing Requirement
- Every LucidBox product MUST use a serif + sans-serif pair (system fonts acceptable for native apps)

### Approved Fonts

| Category | Approved | Reject Examples |
|----------|----------|-----------------|
| Serif | Cormorant Garamond, Playfair Display, Source Serif 4 | Georgia, Times New Roman, Merriweather |
| Sans | DM Sans, Space Grotesk, Inter, IBM Plex Sans, Plus Jakarta Sans | Arial, Helvetica, Comic Sans, Roboto, Open Sans |
| Mono | JetBrains Mono, IBM Plex Mono | Courier New, Monaco, Fira Code |
| System | SF Pro (iOS/macOS only -- PracticePal) | System fonts on web |

- REJECT: any font family not listed above (flag and suggest nearest approved alternative)

### Type Scale Reference

| Level | Size | Weight | Line Height |
|-------|------|--------|-------------|
| Display | 34px | 700 | 1.2 |
| H1 | 28px | 600 | 1.3 |
| H2 | 22px | 600 | 1.35 |
| H3 | 20px | 600 | 1.4 |
| Body | 15-17px | 400 | 1.6 |
| Small | 13-14px | 400 | 1.5 |
| Micro | 11-12px | 500 | 1.4 |

### Letter Spacing
- Headings: `-0.02em` to `-0.01em` | Body: `0` | Uppercase labels: `0.06em` to `0.15em`

---

## Surface Rules

### Glassmorphism

| Variant | Blur | Background | Border Required |
|---------|------|------------|-----------------|
| Standard (dark) | `20px` | `rgba(30, 28, 25, 0.72)` | YES -- `rgba(196, 151, 70, 0.15)` |
| Strong (dark) | `20px` | `rgba(36, 32, 28, 0.88)` | YES |
| Elevated (dark) | `24px` | `rgba(255, 255, 255, 0.10)` | YES |
| Standard (light) | `20px` | `rgba(255, 253, 248, 0.65)` | YES -- `rgba(200, 190, 170, 0.4)` |

- Glass cards MUST have a border (glass without border = broken)
- Max 3 stacking glass layers (performance)
- Mobile: provide solid fallback at 95% opacity (backdrop-blur is expensive)
- Include `-webkit-backdrop-filter` alongside `backdrop-filter`

### Film Grain
- Opacity: 3-5% max (`0.03` - `0.05`)
- Blend mode: `soft-light`
- Must be `pointer-events: none` and `position: fixed`

### Ambient Glow
- Max opacity: `0.12` -- the effect must be felt, not seen
- REJECT: glow opacity above 12%

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | `4px` | Badges, small elements |
| `radius-md` | `8px` | Buttons, inputs |
| `radius-lg` | `12px` | Secondary cards |
| `radius-xl` | `16px` | Primary cards, containers, modals |
| `radius-full` | `24px` | Pills, avatars |

- Default card radius: `16px`
- Exception: Tutelage uses `4px` (field-notes aesthetic -- documented override)

### Shadows
- `sm`: `0 1px 3px rgba(0,0,0,0.04)` | `md`: `0 4px 24px rgba(0,0,0,0.12)` | `lg`: `0 8px 32px rgba(0,0,0,0.3)` | `xl`: `0 16px 48px rgba(0,0,0,0.4)`
- Glass cards use border + backdrop-blur for depth; shadows are secondary

---

## Motion Rules

### Timing

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Hover | `200ms` | `ease` |
| Tab/page switch | `250ms` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Card expand / slide-in | `300ms` | `spring(0.34, 1.2, 0.64, 1)` or `ease-out-cubic` |
| Scroll reveal | `550ms` | `ease-out` + `translateY(16px)` |
| Progress/skill fill | `1200ms` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |

- Spring physics preferred over linear easing
- REJECT: `transition: all` (be explicit about which properties animate)
- REJECT: animation duration > `1200ms` unless loading/shimmer state
- MUST include `prefers-reduced-motion` media query for all animations (zero-duration override)

### Scroll Reveal Standard
- Initial: `opacity: 0; transform: translateY(16px)`
- Revealed: `opacity: 1; transform: translateY(0)`
- Duration: `550ms`, easing: `ease-out`
- Intersection Observer: threshold `0.1`, root margin `0px 0px -30px 0px`

---

## Spacing

- Base grid: `4px`
- Scale: `4 / 8 / 16 / 24 / 32 / 48 / 64 / 80px`
- Section gap: `80px`
- Max content width: `860px` (reading) or `1080px` (dashboard)
- REJECT: spacing values not on the 4px grid (e.g., `5px`, `13px`, `22px`)

---

## Sub-Brand Override Lookup (Verification Order)

1. Check `LucidBox-LLC/design/sub-brands.md` accent color map
2. Check project-root `BRAND.md` or `DESIGN.md` (Stitch-compatible)
3. Check project-root `DESIGN_BIBLE.md` or `DESIGN-BRIEF.md` (legacy naming)
4. If value matches any documented source above: **compliant**
5. If value is NOT in master tokens OR any documented override: **flag it**
