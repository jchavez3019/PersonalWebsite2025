# 0003 — Mandarin Bingo UI

- **Wave:** side-quests / wave_1
- **Status:** Completed
- **ADR:** [0001 — Mandarin Character Bingo Generator](../../../adrs/side_quests/0001_mandarin_bingo_generator.md)
- **Depends on:** [0001_persistence_and_migrations](./0001_persistence_and_migrations.md), [0002_board_generation](./0002_board_generation.md), [0008_active_labels_and_eligibility](./0008_active_labels_and_eligibility.md)

## Goal

Angular mini-app: full vocabulary list (Class/Label, exclude/delete/edit), Active labels + sort, place/move/swap on the board (drag + required non-drag fallback), fill remaining cells, session pinyin toggle, print, reset-with-confirm.

Detail for Active labels / eligibility: [0008](./0008_active_labels_and_eligibility.md). Detail for edit/sort/board move: [0009](./0009_vocab_edit_sort_and_board_move.md).

## Placement

```text
src/app/components/side-quests/mandarin-bingo/
  mandarin-bingo.component.ts
  mandarin-bingo.component.html
  mandarin-bingo.component.css
  mandarin-bingo.component.spec.ts
  mandarin-bingo-entry-dialog/   (edit/add MatDialog)
```

Standalone component; selector e.g. `app-mandarin-bingo`.

## Layout

### 1. Vocabulary list

Show **all** working entries (including ineligible), each with fixed grid slots:

character · pinyin · English · Class · Label · [edit] · [delete] · Exclude

Header: `x/n` | Sort | Active labels.

Controls:

- **Exclude / include** — when label active: toggles `excludedByUser`. When label inactive: Option A (blocked uncheck). On exclude/ineligibility: clear board cells with fade.
- **Delete** — **custom only**.
- **Edit** — **custom only** → MatDialog ([0009](./0009_vocab_edit_sort_and_board_move.md)).
- **Add custom** — same dialog or equivalent form fields including optional label.
- **Reset to preset** — confirmation warning customs deleted; then `resetCharacterList()`, empty board, Active labels = all preset labels.

### 2. Actions

- **Fill empty cells** — eligible pool only ([0008](./0008_active_labels_and_eligibility.md)).
- **Clear board** — `createEmptyBoard()`; vocabulary unchanged.
- **Show pinyin on board** — session-only boolean, default `true`.
- **Print** — [0004](./0004_print_stylesheet.md).

### 3. Board preview

- 5×5; FREE center; empty or character cells.
- Character + optional pinyin (toggle); **never** English.
- Place, move, swap, remove ([0009](./0009_vocab_edit_sort_and_board_move.md)).

## Component state

- `entries` from `loadCharacterList()`.
- `board` = `createEmptyBoard()` on load (session-only).
- `showPinyinOnBoard = true` on load (session-only).
- `activeLabels` = all labels present on load (session-only).
- `errorMessage`, optional `selectedEntryId` / `selectedBoardIndex` for tap interactions.
- Confirm dialog state for reset.

## Acceptance criteria

- [ ] List shows Class/Label; ineligible stay visible and marked; `x/n` accurate.
- [ ] Preset cannot be deleted; exclude + Option A; custom edit/delete.
- [ ] Becoming ineligible clears matching board cells; reset requires confirm and factory-restores.
- [ ] Drag and non-drag place/move work; fill respects eligibility; pinyin toggle session-only.
- [ ] Board never shows English; print control present.

## Out of scope

- Routes/listing (0005/0007); PDF/audio; simplified→traditional conversion; persisting board, pinyin toggle, or Active labels.
