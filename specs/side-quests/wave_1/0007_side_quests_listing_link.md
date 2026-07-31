# 0007 — Side Quests Listing Page and Extensibility

- **Wave:** side-quests / wave_1
- **ADR:** [0000 — Side Quests Home Tab](../../../adrs/side_quests/0000_side_quests_tab.md); bingo link per [0001](../../../adrs/side_quests/0001_mandarin_bingo_generator.md)
- **Depends on:** [0005_route_registration](./0005_route_registration.md) (for the first quest’s deep link)

## Goal

Specify the **Side Quests** home tab: a clean extensible catalog (preview icon, title, description, creation date). First row: Mandarin bingo.

## Tab wiring

1. Add `'side-quests'` to `NavbarService.tabOptions`.
2. Navbar + mobile drawer label: **Side Quests**.
3. `HomeComponent` `*ngSwitchCase="'side-quests'"` → `SideQuestsComponent`.

```text
src/app/components/home/side-quests/
  side-quests.component.ts
  side-quests.component.html
  side-quests.component.css
  side-quests.component.spec.ts
```

## Catalog data model

```ts
interface SideQuest {
  id: string;
  title: string;
  description: string;
  previewImage: string;
  createdAt: string; // YYYY-MM-DD
  /** Canonical catalog field (matches Projects). Not the Angular template directive name. */
  router_link: string;
}
```

### Display

- Vertical list rows: preview icon, title, description, human-readable `createdAt`.
- Navigate via `router_link` (row or Open control). Newest `createdAt` first; tie-break `id`.
- Page title **Side Quests** + short intro; Material-consistent, lighter than Projects cards.

## First entry: Mandarin bingo

```ts
{
  id: 'mandarin-bingo',
  title: 'Mandarin Character Bingo',
  description:
    'Generate a printable 5×5 bingo board of traditional Mandarin characters with optional pinyin on the tiles.',
  previewImage: 'assets/side_quests/bingo_board_icon.png',
  createdAt: '2026-07-26',
  router_link: '/side-quests/mandarin-bingo',
}
```

- Preview asset (shipped): [`src/assets/side_quests/bingo_board_icon.png`](../../../src/assets/side_quests/bingo_board_icon.png).
- Adjust `createdAt` to the real publish date at merge if it differs.

## How to add a future Side Quest

Comment above the catalog array:

1. Build mini-app under `src/app/components/side-quests/<quest-slug>/`.
2. Register route `side-quests/<quest-slug>` before `**`.
3. Add preview under `src/assets/side_quests/` (or the assets folder used for quest icons).
4. Append `SideQuest` with all required fields including `router_link`.
5. Verify tab row + navigation.
6. Do not embed the mini-app in the tab body.

## Unit tests

- Renders title, description, date, preview `src` per quest.
- Bingo open targets `/side-quests/mandarin-bingo` (`router_link` / `routerLink` template binding).
- Sort order when multiple dates present.

## Acceptance criteria

- [ ] Tab reachable; list shows icon, title, description, date.
- [ ] Bingo entry uses `router_link: '/side-quests/mandarin-bingo'`.
- [ ] Extensibility checklist documented in code comment.

## Out of scope

- Bingo domain (0000–0004); search/tags; moving Projects into Side Quests.
