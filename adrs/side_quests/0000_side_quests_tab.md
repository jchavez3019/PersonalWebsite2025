# 0000 — Side Quests Home Tab and Listing Pattern

- **Status:** Proposed
- **Date:** 2026-07-26

## Context

The personal site already exposes **Home**, **Projects**, and **Papers** as in-app tabs on the landing shell. Tab state is owned by `NavbarService` (`tabOptions` + `currentHomeContent$`), not by Angular Router paths. Desktop navbar buttons and the mobile drawer call `navigateTab(...)`; `HomeComponent` switches content with `*ngSwitchCase`.

**Projects** is the career/research portfolio: cards with technologies, GitHub links, PDFs, videos, and occasional `router_link` entries into full mini-apps under `hosted_projects/`. That framing is the wrong home for small, playful, one-off ideas that are still worth sharing but are not meant to signal research or professional focus.

We need a first-class navigation surface for those ideas (“side quests”) that:

1. Is discoverable next to the existing tabs.
2. Reuses the established tab + listing patterns so maintenance cost stays low.
3. Leaves room for interactive quests to be full routed experiences when they need their own UI chrome (print layouts, editors, etc.).

## Decision

### New home tab: `side-quests`

Add `side-quests` as a valid entry in `NavbarService.tabOptions`, alongside `home`, `projects`, and `papers`.

Wire the same three places Projects/Papers already touch:

1. Desktop navbar in `navbar.component.html`.
2. Mobile drawer entries in `home.component.html`.
3. `HomeComponent` template `*ngSwitchCase="'side-quests'"` rendering a dedicated listing component.

Tab switching remains service-driven. We will **not** introduce a real Angular route solely to represent the Side Quests tab body (consistent with the existing home-tab model and the router comments in `app.routes.ts`).

### Listing component

Create `src/app/components/home/side-quests/` (component + template + styles + unit tests).

Catalog presentation is a **clean vertical list** (lighter than the Projects card grid). Each entry **requires**:

- Preview icon / thumbnail
- Title
- Short description
- Creation date (`YYYY-MM-DD` in data; human-readable in the UI)
- `router_link` to the quest mini-app (canonical catalog field name; matches Projects)

Metadata lives as a TypeScript array in source control. Adding a future quest is: build mini-app → register route → add asset → append one catalog object. Implementation detail and the first Mandarin bingo row are specified in wave_1 [0007](../../specs/side-quests/wave_1/0007_side_quests_listing_link.md).

### Interactive quests vs. listing content

- **Listing tab:** catalog and short blurbs only.
- **Interactive mini-apps:** dedicated Angular routes under `src/app/components/side-quests/` (see [0001](./0001_mandarin_bingo_generator.md)), registered in `app.routes.ts`, linked from a side-quest entry via `router_link`.

The first concrete quest (Mandarin bingo) follows that routed pattern; see [0001](./0001_mandarin_bingo_generator.md).

### Content ownership

Side-quest metadata stays in source control as TypeScript constants in the listing component. No CMS, API, or user accounts for authoring quests.

## Consequences

### Positive

- Clear product boundary: career work stays under Projects; playful one-offs under Side Quests.
- Implementation cost is mostly mechanical (tab id + listing component + switch case).
- Hosted routes keep heavy UI out of the home tab switcher and preserve deep-linkable URLs for print/share flows.

### Negative / trade-offs

- Another tab increases nav density on small screens; copy must stay short.
- Mobile drawer `routerLink` paths for tabs remain cosmetic unless/until true tab routes are added site-wide; tab changes still go through `navigateTab`.
- Listing data is code-reviewed and redeployed like Projects—no runtime editing of the catalog.

### Non-goals

- Backend or CMS for side-quest content.
- Replacing the Projects tab or moving existing portfolio cards into Side Quests.
- Embedding full interactive apps inside the tab `ngSwitch` body.
- Restoring the commented-out Blog tab as part of this work.
