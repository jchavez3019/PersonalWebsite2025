# 0006 — Unit Test Plan

- **Wave:** side-quests / wave_1
- **Status:** Completed
- **ADR:** [0001 — Mandarin Character Bingo Generator](../../../adrs/side_quests/0001_mandarin_bingo_generator.md)
- **Depends on:** [0000](./0000_domain_types_and_preset.md); expands with [0001](./0001_persistence_and_migrations.md), [0002](./0002_board_generation.md), [0003](./0003_mandarin_bingo_ui.md), [0008](./0008_active_labels_and_eligibility.md), [0009](./0009_vocab_edit_sort_and_board_move.md)

## Goal

Curate unit tests so migrations, eligibility layers, board fill/move, and UI contracts stay regression-safe. Pure modules for domain logic; TestBed for the component. Karma/Jasmine, intent-driven names, BDD Given/When/Then docblocks.

## File map

| Area | Spec file (suggested) | Style |
|---|---|---|
| Migrations / load-save | `mandarin-bingo-migrations.spec.ts`, `mandarin-bingo-storage.spec.ts` | Pure + mocked `localStorage` |
| Eligibility | `mandarin-bingo-eligibility.spec.ts` | Pure |
| Board | `mandarin-bingo-board.spec.ts` | Pure |
| UI | `mandarin-bingo.component.spec.ts` | TestBed |
| Preset | `mandarin-bingo.preset.spec.ts` | Sanity |
| Listing (0007) | `side-quests.component.spec.ts` | TestBed |

## Migration fixtures

```text
fixtures/character-list-v1.valid.json
fixtures/character-list.corrupt.txt
fixtures/character-list-future-version.json
```

Valid v1 fixtures must include `translation`, `source`, `label`, `excludedByUser`, timestamps. Cover: current no-op, corrupt → preset, newer → preset, legacy `excluded`-only → preset, (later) older → migrate write-back.

## Preset sanity

- Length === 24; unique ids/characters; all `source === 'preset'`, `label === 'Lesson 5'`, `excludedByUser === false`.
- Spot-check 這/zhè, 老師/lǎoshī, 加州/Jiāzhōu against verified 0002 table.

## Eligibility cases ([0008](./0008_active_labels_and_eligibility.md))

- Deactivate L → ineligible; `excludedByUser` unchanged.
- Reactivate L → **`excludedByUser` preserved**.
- Option A: uncheck while L inactive → blocked.
- Empty Active labels → `x=0`.
- `x/n` counts eligible / total.
- Collect labels includes `""` for Unlabeled.

## Board cases

- Full fill: 25 cells, FREE at 12, unique ids, skips ineligible.
- Insufficient eligible pool → `insufficient_entries`.
- Partial board: placed cells unchanged after fill remaining.
- `placeEntryOnBoard` rejects ineligible / duplicate / FREE.
- `clearEntryFromBoard` removes all cells with that id.
- Move to empty / swap occupied / remove off board.

## Storage cases

- Round-trip envelope including `excludedByUser: true` and `label`.
- Reset restores verified preset (no customs; all `excludedByUser: false`).
- Board / pinyin toggle / `activeLabels` never written to storage.
- Legacy `excluded` without `excludedByUser` → preset fallback.

## Component cases (lean)

- List shows English + Class/Label; ineligible row still visible.
- Delete control absent for preset; present for custom.
- Exclude clears board cell for that entry.
- Reset opens confirm; cancel leaves state; confirm factory-restores.
- Pinyin toggle hides board pinyin only; session default on after recreate.
- Tap-to-place places on empty cell without drag.
- English never on board.
- Reserved label rejected on custom save.

## Print

- Print handler invokes injectable once; CSS/toggle manual per [0004](./0004_print_stylesheet.md).

## Acceptance criteria

- [ ] Fixture-backed load/migrate paths; eligibility + partial-fill + move/swap board tests; preset spot-checks; lean UI tests above.
- [ ] `ng test` (or targeted equivalent) passes; no live network.

## Out of scope

- Playwright e2e required for wave exit; visual regression; S3 deploy verification; chrome-devtools-mcp (follow-up).
