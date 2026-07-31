# 0009 — Vocab Edit, Sort, and Board Move

- **Wave:** side-quests / wave_1
- **Status:** Completed
- **ADR:** [0001 — Mandarin Character Bingo Generator](../../../adrs/side_quests/0001_mandarin_bingo_generator.md)
- **Depends on:** [0003_mandarin_bingo_ui](./0003_mandarin_bingo_ui.md), [0008_active_labels_and_eligibility](./0008_active_labels_and_eligibility.md)

## Goal

Edit custom vocabulary via MatDialog, sort the list, reserved preset labels, tile drag ghost, and board move/swap/remove with fade.

## Vocabulary row layout

Fixed CSS grid slots (Exclude aligns for preset and custom):

character · pinyin · English · Class · Label · [edit] · [delete] · Exclude

- Edit/delete slots always reserved; empty for preset.
- Placed-on-board highlight: light green on the vocab row (mutually exclusive with ineligible).
- Header: `x/n` | Sort | Active labels.

## Edit / add custom

- Pencil (custom only) or Add → MatDialog + reactive form: character, pinyin, English, label.
- Label MatAutocomplete suggests **custom** labels only (never reserved preset labels).
- Reserved labels = any label on preset-class rows (today `"Lesson 5"`); reject on custom save.
- Label max ~15 chars; unlabeled = `""`.
- Cancel gray / Save light blue; on save update `modifiedAt`, persist, MatSnackBar green check + “Saved” (~2s).
- Edit label A→B when B inactive: save label; ineligible via gate; do not change `excludedByUser`; fade if placed.

## Sort (session UI preference)

- created asc/desc (presets: fixed shipped timestamps)
- modified asc/desc (presets older fixed `modifiedAt`; customs real)
- pinyin asc/desc; English asc/desc; label asc/desc (**unlabeled last**)

## Board interactions

- Drag/click place from list; **tile-sized drag ghost** (hanzi + pinyin if toggle on).
- Move: select board tile or drag; empty = move; occupied = **swap**; drag/click off board = **remove**.
- Fade-out when clearing due to ineligibility (and preferably on manual remove).

## Acceptance criteria

- [ ] Edit dialog + snackbar; reserved label validation; autocomplete custom-only.
- [ ] Sort modes above; row grid alignment; placed highlight.
- [ ] Move/swap/remove; tile drag ghost; fade on ineligibility.
- [ ] Unit tests for swap/move/remove, reserved labels, label edit edge cases.

## Out of scope

- chrome-devtools-mcp (follow-up after implementation); S3 deploy.
