# DialBrio Design System

> Source of truth for DialBrio's visual language, interaction patterns and UI rules.
> Components that contradict this document are bugs. Change this file first, then the code.
>
> **v2 (Sept 2026).** The v1 electric-blue-on-navy direction read as a generic AI SaaS template. v2 moves to
> warm paper, green-black ink and one signal green, with typography carrying the hierarchy — the visual
> language of the product/pricing documents (Features, Pricing, Business Model).

Implementation lives in:

| Concern | Location |
| --- | --- |
| Tokens (CSS variables, light + dark) | `apps/web/src/app/globals.css` |
| Logo system | `apps/web/src/components/brand/logo.tsx`, `apps/web/public/brand/*` |
| Primitives | `apps/web/src/components/ui/*` |
| Domain components | `apps/web/src/components/domain/*` |
| Application shell | `apps/web/src/components/shell/*` |

---

## 1. Brand principles

DialBrio is **serious sales infrastructure, designed by people who have sat on a phone floor**. It should
feel like a well-made tool: calm, dense, specific, a little editorial — never like a template.

| We are | We are not |
| --- | --- |
| Specific, plain-spoken, operator voice | Hype ("supercharge", "unlock", "seamless") |
| Warm paper, ink, one signal colour | Electric blue on navy, gradients, glow |
| Typographic hierarchy | Icon tiles and pills doing the work of type |
| Dense and calm | Six identical cards in a grid, everywhere |
| Honest about what exists | Fake functionality, "AI" on everything |

Principles that resolve design disagreements, in priority order:

1. **The calling loop wins.** Select lead, dial, talk, capture outcome, next action, next lead. Any
   decision that adds a click to that loop needs a strong reason.
2. **State over decoration.** Colour, motion and emphasis exist to communicate state (ringing,
   connected, failing, at risk). If an effect communicates nothing, remove it.
3. **Type before chrome.** Reach for a heading, a divider or whitespace before a card, a badge or an icon.
4. **Honest system.** Never present mock or unavailable functionality as real. AI output always
   shows confidence and never silently mutates important state.
5. **Complexity lives in the system, not in the user's face.** Summary first, detail on demand.

## 2. Logo usage

### Concept

The mark is a **D** whose counter (inner space) is a **speech bubble** with a tail pointing down-left,
led by three **stepped motion bars** on the left.

- **D** — the brand initial, geometric stem + bowl.
- **Conversation** — expressed through negative space, not a literal telephone handset. The mark
  reads as "a conversation starts here", which covers calls and SMS equally.
- **Forward motion** — the bars step down in length (9.5 / 7 / 4.5 units), implying speed into
  the letter.

The original prototype placed a handset inside the D. It was removed because a handset becomes
illegible below 24px, reads as a generic telecom icon, and ties the brand to voice only.

### Variants

| Variant | Component | Use |
| --- | --- | --- |
| Primary horizontal | `<Logo variant="full" />` | Marketing header, login, documents |
| Compact | `<Logo variant="compact" />` | App top bar, sidebar header, tight headers |
| Icon only | `<LogoMark />` | Collapsed sidebar, avatars, loading states |
| App icon | `public/brand/app-icon.svg` | 48px+ tiles (green mark on ink) |
| Favicon | `app/icon.svg` | 16–32px (simplified mark: two thicker bars) |
| Monochrome | `<LogoMark tone="mono" />` | Single-colour print, embossing, watermarks |
| On dark / on light | `tone="brand"` (default): signal-green mark, ink wordmark (follows `--fg`) | Any themed surface |
| On brand fill | `tone="white"` | App icon, brand-blue backgrounds |

Wordmark: **DialBrio** in one colour (`--fg`), Schibsted Grotesk 800, tracking `-0.035em`. The mark is solid
signal green (`--brand`); no gradient. App icon and favicon: green mark on an ink square.
No trademark symbol inside product UI.

### Size rules

| Size | Mark detail |
| --- | --- |
| ≥ 24px | Full mark: three bars + speech-bubble counter |
| 16–23px | `simplified` mark: two bars, thicker; counter tail kept |
| < 16px | Do not use — use the letter D in a brand square |

Clear space around the logo equals the height of the D's stem width × 2. Minimum wordmark height 16px.

### Do not

- Recolour the mark with arbitrary colours, apply glows, drop shadows, bevels or 3D.
- Add gradients back to the mark or recolour it blue.
- Stretch, rotate, outline or animate the logo continuously.
- Put the handset back inside the D.

## 3. Color tokens

Raw palette (do **not** use raw hex in components — use the semantic tokens in §4):

| Name | Hex | Role |
| --- | --- | --- |
| Ink | `#16201C` | Primary text on paper; dark panels |
| Ink (dark bg) | `#111815` / `#171F1C` / `#1D2622` | Dark theme background → surface → elevated |
| Paper | `#F7F6F2` | Light background (warm, not grey-blue) |
| Paper sunken | `#F1EFE9` | Sidebar, wells, table headers |
| Hairline | `#E4E1D8` / `#D3CFC3` | Borders |
| Signal green | `#13A06B` (dark `#22B87C`) | Brand, primary action, connected, positive |
| Green solid | `#0E7F55` | Filled buttons (white text 5.0:1) |
| Amber | `#D98A1C` (text `#8F5205`) | Attention, callouts, warm leads, wrap-up |
| Vermilion | `#C8442F` (text `#B8392A`) | Failed, at risk, DNC |
| Slate blue | `#2F63A3` (dark `#7FA9E0`) | Info and ringing only |
| Violet | `#6B4FD1` (dark `#A996F2`) | AI output only |

There is exactly one brand colour. Blue is an info colour, not a brand colour.

### Contrast

All text tokens meet WCAG 2.2 AA (4.5:1) on their intended surface. Checked pairs: white on green solid
5.02 · green text on white 6.55 · muted `#5E6863` on paper 5.34 · dark muted `#8A948E` on `#1A2420` 5.09 ·
amber text 5.00 · vermilion text 5.74 · white on danger solid 5.31. Signal green `#13A06B` is **never** used
for small text on white (3.35:1) — use `--brand-text`.

## 4. Semantic colors

Defined for both themes in `globals.css`, exposed to Tailwind via `@theme inline`
(`bg-surface`, `text-fg-muted`, `border-border`, `bg-sidebar` …).

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| `--background` | `#F7F6F2` | `#111815` | Workspace canvas |
| `--sidebar` | `#F1EFE9` | `#131A17` | App frame: sidebar + top bar |
| `--surface` | `#FFFFFF` | `#171F1C` | Cards, panels, tables |
| `--surface-elevated` | `#FFFFFF` + shadow | `#1D2622` | Menus, drawers, dialogs |
| `--surface-sunken` | `#F1EFE9` | `#131A17` | Inputs, wells, table header |
| `--fg` / `--fg-secondary` / `--fg-muted` | `#16201C` / `#45504B` / `#5E6863` | `#ECEEE9` / `#AAB2AC` / `#8A948E` | Text |
| `--border` / `--border-strong` | `#E4E1D8` / `#D3CFC3` | `#26302C` / `#34403B` | Hairlines |
| `--brand` / `--brand-solid` / `--brand-soft` / `--brand-text` | green family | green family | Brand, primary action |
| `--success` `--warning` `--danger` `--info` (+ `-soft`, `-text`, `-solid`) | | | Status |
| `--ai` / `--ai-soft` / `--ai-text` | violet | violet | AI output only |
| `--call-ringing` / `-connected` / `-wrap` / `-ended` / `-failed` | blue / green / amber / muted / vermilion | | Call state |
| `--lead-fresh` / `-warm` / `-aged` / `-zombie` | green / amber / clay / grey | | Lead lifecycle |
| `--chart-1..6` | green, ink, violet, amber, blue, sand | | Series (§19) |

## 5. Typography

Three families, each with one job:

| Family | Token | Use |
| --- | --- | --- |
| **Schibsted Grotesk** 700–800 | `font-display` | Page titles, section titles, marketing headlines, big numbers (KPIs, prices, timers) |
| **Instrument Sans** | `font-sans` (default) | All UI and body text |
| **JetBrains Mono** | `font-mono` | Eyebrows, spec chips, phone numbers, IDs, timestamps, rates, money in tables |

| Style | Size / line-height | Weight | Tracking | Use |
| --- | --- | --- | --- | --- |
| Display | 56–72px / 1.0 | 800 | -0.04em | Marketing H1 |
| Marketing H2 | 36–44px / 1.08 | 700 | -0.03em | Marketing sections |
| Page title | 30px / 36px (26 mobile) | 700 | -0.03em | App `h1` |
| Big number | 28–32px | 700 | -0.03em | KPI values (proportional figures) |
| Section title | 18–20px | 700 display or 600 sans | -0.02em | Section within a page |
| Card heading | 14.5px / 20px | 600 | -0.005em | Card and panel titles |
| Body | 14px / 1.5 | 400 | 0.004em | Default |
| Supporting | 13px | 400 | | Descriptions, table cells |
| Label | 12–13px | 500 | | Sentence case, `text-fg-muted` |
| Eyebrow | 11.5px mono | 600 | 0.08em uppercase | `.eyebrow` — section intros only ("01 · DIALING ENGINE") |

Rules: labels are **sentence case**. Uppercase appears only in `.eyebrow`, at most once per section.
Tabular figures (`tabular`) are for changing numbers in sans/mono; the display face uses proportional figures.

## 6. Spacing scale

4px base grid (Tailwind default spacing, `1 = 4px`).

| Token | px | Typical use |
| --- | --- | --- |
| 0.5 | 2 | Icon/text micro gap |
| 1 | 4 | Badge padding-y |
| 1.5 | 6 | Tight inline gap |
| 2 | 8 | Control inner gap, list gap |
| 3 | 12 | Card inner gap, form row gap |
| 4 | 16 | Card padding (compact), page gutter (mobile) |
| 5 | 20 | Card padding (default) |
| 6 | 24 | Page gutter (desktop), section gap |
| 8 | 32 | Between major page sections |
| 12–24 | 48–96 | Marketing section rhythm |

## 7. Border radii

| Token | Value | Use |
| --- | --- | --- |
| `--radius-xs` | 4px | Checkboxes, keyboard hints |
| `--radius-sm` | 6px | Small controls |
| badge | 5px | Badges and spec chips (not pills) |
| button | 7px | Buttons, inputs |
| `--radius-lg` | 10px | Cards, panels, popovers |
| `--radius-xl` | 14px | Drawers, dialogs, the inset workspace corner |
| `full` | 9999px | Avatars, status dots only |

## 8. Shadows

Borders do most of the work. Light mode uses near-invisible shadows (`--shadow-xs` is a 1px bottom line);
dark mode uses surface steps and borders only. No coloured glows anywhere.

## 9. Iconography

- **One family: Lucide.** No emoji, anywhere.
- Icons are for **actions and state**, not decoration. Do not put an icon in front of every label,
  heading or table column; do not wrap icons in coloured tiles.
- Sizes: 14px dense, 16px default, 18px navigation. Stroke 2 (1.75 at ≥ 20px).
- Icon-only buttons always have `aria-label` + tooltip.
- `Sparkles` marks generative AI output (AI summary) and nothing else.

Canonical mapping: Overview `LayoutDashboard` · Dialer `PhoneCall` · Queue `ListOrdered` · Campaigns
`Megaphone` · Conversations `MessagesSquare` · Contacts `Contact` · Calendar `CalendarDays` · Analytics
`ChartColumn` · AI QA `Bot` · Numbers `Hash` · Workflows `Workflow` · Compliance `ShieldCheck` · Team
`UsersRound` · Integrations `Plug` · Billing `CreditCard` · Settings `Settings` · Voicemail drop `Voicemail` ·
Lead states Fresh `CircleDot` / Warm `Flame` / Aged `Hourglass` / Zombie `CircleDashed`.

## 10. Motion

Motion communicates state. Library: `motion` (`motion/react`).

| Token | Value | Use |
| --- | --- | --- |
| `--duration-fast` | 120ms | Hover, press, toggle |
| `--duration-base` | 180ms | Menus, tooltips, tabs |
| `--duration-slow` | 280ms | Drawers, modals, call-state transitions |
| `--duration-slower` | 400ms | Page-level / chart transitions |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Moves, reorders |

Sanctioned animations:

| Animation | Where |
| --- | --- |
| Ring pulse (1.6s, 2 expanding rings) | Ringing / incoming call indicator only |
| Live dot pulse (2s opacity) | Connected call, live sync, live agent status |
| Queue item layout transition | Queue reorder, next-lead promotion |
| Drawer/modal slide + fade | Overlays |
| Transcript line fade-in | Live transcription |
| Skeleton shimmer | Loading |

`prefers-reduced-motion: reduce` disables pulses, shimmer and layout transitions (the global CSS and
`<MotionConfig reducedMotion="user">` both enforce this). State must remain readable without motion.

Forbidden: animated gradient backgrounds, floating objects, parallax, 3D rotation, continuous glow.

## 11. Responsive breakpoints

| Name | Min width | Behaviour |
| --- | --- | --- |
| base | 0 | Mobile: sidebar → drawer, tables → cards, dialer stacked |
| `sm` | 640px | Large phones |
| `md` | 768px | Tablet: two-column forms, tables scroll horizontally |
| `lg` | 1024px | Sidebar visible (collapsed by default), dialer two columns |
| `xl` | 1280px | Sidebar expanded, dialer three columns |
| `2xl` | 1440px | Primary target; max content width 1600px |

Touch targets are ≥ 44px below `lg` (`min-h-11` on interactive rows and icon buttons).

## 12. Grid / layout

- **App shell:** top bar 56px; sidebar 248px expanded / 64px collapsed; workspace scrolls
  independently of the shell.
- **Page anatomy:** `PageHeader` (title, description, primary action, secondary actions) → optional
  toolbar (filters/search/tabs) → content.
- **Page gutter:** 16px mobile, 24px desktop. Max width 1600px, left-aligned inside the workspace.
- **Dashboard grid:** 12 columns, 16px gap. KPI row is 6 × 2 columns at `xl`, 3 × 2 at `md`, 2 × 3 at base.
- **Dialer:** full-height workspace, no page scroll on desktop; each column scrolls independently.

## 13. Navigation architecture

- **App frame:** the sidebar and top bar share `--sidebar` (sunken paper). The workspace is an inset panel on
  `--background` with a 14px top-left radius and hairline border: the content reads as the page, the frame
  as the desk it sits on.
- Sidebar groups: Primary (no label), Intelligence, Operations, Admin, with group labels in sentence case.
- Active item: `--surface` fill + `--shadow-sm`, icon in `--brand`. No left accent bar, no tinted fill.
- Org/sub-account switcher at the top (ink monogram square), profile at the bottom, `⌘\` collapses.
- Items the role cannot access are hidden, not disabled.
- Top bar: breadcrumb (sub-account / page), `⌘K` search, live sync indicator, notifications, help.
- Mobile: sidebar becomes a left drawer.

## 14. Buttons

`<Button variant size>` from `components/ui/button.tsx`.

| Variant | Use | Rule |
| --- | --- | --- |
| `primary` | The single primary action on a surface | Max one per view region |
| `secondary` | Neutral actions | Surface fill + border |
| `ghost` | Toolbars, low-emphasis | No border until hover |
| `outline` | Secondary in dense forms | |
| `danger` | Destructive (End call, Delete, Add to DNC) | Requires confirmation when irreversible |
| `success` | Call / connect action only | Dialer "Call" button |
| `link` | Inline text action | |

Sizes: `sm` 32px, `md` 36px (default), `lg` 44px (dialer controls, marketing CTA), `icon` square.
Loading: spinner replaces the leading icon; width does not change; `aria-busy`.
Every icon-only button has an `aria-label` and a tooltip.

## 15. Forms

- React Hook Form + Zod schemas (schemas live in `lib/validation` and are shared with the API later).
- Labels above inputs, 12px/500. Help text below in `--fg-muted`. Errors below in `--danger-text` with
  `CircleAlert` icon and `aria-describedby`.
- Inputs 36px high, `--surface-sunken` fill, `--border-strong` border, `--brand` focus ring (2px, offset 0).
- Group related fields into `FormSection`s with a title and a one-line description.
- Long configuration is split into steps (Campaign wizard) or tabs (Settings). Never one mega-page.
- Destructive settings live in a separate "Danger zone" card at the bottom.

## 16. Cards

- `Card` = `--surface` + 1px `--border` + 10px radius. Use it for things that are genuinely separate objects.
- Prefer **one bordered container with internal dividers** over a grid of separate cards
  (a KPI strip is one row with vertical rules, not six boxes).
- Card header: 14.5px/600 title, optional 13px description, actions right. No icon tile in the header.
- KPI (`StatCard`): sentence-case label, display-face number, delta with arrow + text. Same style everywhere.
- Spec chip (from the product documents): `font-mono text-xs bg-brand-soft text-brand-text rounded-[5px] px-2 py-1`.

## 17. Tables

- TanStack Table via `DataTable`. Header row sticky, `--surface-sunken`, 12px/500 `--fg-muted`.
- Row height 44px (comfortable) / 36px (compact). Hover `--surface-hover`, selected `--brand-soft`.
- Numeric columns right-aligned, `tabular-nums`. Phone numbers in mono.
- Row click opens the detail drawer; checkbox column for bulk actions; bulk bar replaces toolbar.
- Below `md`: tables render as stacked cards (`DataTable` `mobileCard` prop) or scroll horizontally
  inside their own container. The page body never scrolls horizontally.
- Pagination: server-side contract (`page`, `pageSize`, `total`); virtualise lists > 500 rows.

## 18. Status system

Status is never communicated by colour alone: every status has **colour + icon or shape + text**.

| Component | States |
| --- | --- |
| `CallStatus` | Idle, Preparing, Dialing, Ringing, Connected, Wrapping up, Completed, Failed |
| `LeadStateBadge` | Fresh, Warm, Aged, Zombie |
| `AgentStatus` | Available, On call, Wrap-up, Break, Offline |
| `NumberHealth` | Healthy, Watch, At risk, Cooling down |
| `CampaignStatus` | Draft, Active, Paused, Completed, Archived |
| `CRMStatus` | Synced, Syncing, Pending, Failed |
| `ComplianceStatus` | Approved, Pending, Action needed, Rejected, Not started |
| `IntegrationStatus` | Connected, Not connected, Needs attention, Error |
| Message delivery | Queued, Sent, Delivered, Read, Failed |

Badge anatomy: 22px pill, soft background, `-text` colour, 12px/500 label, optional 12px icon or
6px `StatusDot`. Live states (ringing, connected, syncing) animate the dot only.

## 19. Charts

- Recharts, loaded with `next/dynamic` on heavy pages.
- Titles state the business question ("Is call volume turning into conversations?").
- Series order: `--chart-1` green (primary measure), `--chart-2` ink (comparison), `--chart-4` amber,
  `--chart-5` slate blue, `--chart-6` sand. `--chart-3` violet is reserved for AI-derived series.
- 1.5–2px strokes, no gradients (flat fill of 10% at most), horizontal gridlines only, 12px muted axis text,
  mono values in tooltips, a screen-reader summary per chart. Max 4 series; more means a table.

## 20. Dialer-specific UI

The dialer is the hero surface. Rules:

- **Layout (≥ xl):** Session header (full width) → Lead panel (left/center, 2 columns wide) → Call panel
  (right, 360px) → Session footer (stats, next lead, CRM sync).
- **Call state is shown in three places, consistently:** the call panel header (large state label +
  timer), the `CallStatus` badge in the session header, and the browser tab title. The page
  background never changes colour.
- **State styling:**
  - Idle — neutral, primary action "Call" (`success` button, 44px).
  - Preparing — spinner, "Checking compliance…" (DNC, calling window, caller ID).
  - Dialing / Ringing — `--call-ringing` ring pulse around the avatar, Cancel button.
  - Connected — `--call-connected` dot + tint strip on the call panel, running timer, audio level meter,
    live transcript (if enabled).
  - Wrapping up — `--call-wrap` indicator, disposition picker focused, wrap-up countdown.
  - Completed — check icon, next lead summary.
  - Failed — `--call-failed` banner with provider reason and Retry (when allowed).
- **Dispositions:** grid of 9, each with an icon and single-key shortcut (1–9). Selecting a disposition
  that needs data (Callback, Appointment) expands an inline form in place — no modal.
- **Next lead:** preloaded while wrapping up. After disposition the next lead animates in and the
  primary button becomes "Call {first name}". Auto-dial next is a per-session toggle.
- **Keyboard:** `Space` call/end (when focus isn't in a text field), `M` mute, `K` keypad,
  `1–9` dispositions, `N` notes, `⌘↵` save & next.
- Compliance blocks (DNC, outside calling window) are deterministic and shown before dialing with
  the reason; the call button is disabled with an explanation, never silently.

## 21. Accessibility

Target: WCAG 2.2 AA.

- Semantic landmarks: `header`, `nav[aria-label]`, `main`, `aside`. One `h1` per page (the page title).
- Visible focus: 2px `--brand` ring via `focus-visible`, never removed.
- Keyboard: every action reachable; Radix primitives provide menus/dialogs/tabs keyboard support;
  sidebar and command palette fully keyboard operable; skip-to-content link.
- Screen readers: icon-only buttons labelled; live call state announced via `aria-live="polite"`;
  toasts announced; charts summarised.
- Contrast: all text tokens ≥ 4.5:1 on their intended surfaces (see §3).
- Touch: 44px minimum targets below `lg`.
- Reduced motion respected globally.
- Status uses colour + icon/shape + text.

## 22. Dark / light rules

- **Light is the default** (warm paper). Dark is a green-black ink theme, not navy and not an inversion.
- Dark depth comes from surface steps (`#111815 → #171F1C → #1D2622`) and borders, never shadows or glow.
- Status hues shift brighter in dark; `-text` tokens carry contrast in both.
- Marketing alternates forced sections: `className="dark"` for ink panels, `className="light"` for paper.

## 23. Examples of correct usage

- Overview KPIs as one bordered strip with dividers; numbers in the display face.
- A section intro: `.eyebrow` "02 · AI INTELLIGENCE", display H2 "A coach on every single call", one plain paragraph.
- Feature detail with a mono spec chip: "Voicemail drop · saves ~1 hr/rep/day".
- Failed GHL sync in Needs attention: reason, time, "Review sync errors" link. No icon tile.
- AI summary: `Sparkles`, violet label, confidence %, "suggestion, verify before acting".

## 24. Examples of what NOT to do

- Electric blue on navy; gradient logo, text or buttons; grid backgrounds; ambient glows.
- UPPERCASE tracked micro-labels on every card ("CALLS TODAY", "WHY THIS LEAD").
- An icon before every label; icons in coloured rounded tiles; pill badges on everything.
- Six identical cards in a row for every group of numbers.
- A left accent bar on the active nav item.
- Copy tics: "seamless", "unlock", "supercharge", "elevate", three-item lists for rhythm, em-dash chains.
- `Sparkles` anywhere other than generated AI output. Emoji anywhere.
- Fake live data on production paths, or features presented as working before they exist.
- Raw hex in components; `dark:` variants instead of tokens.

