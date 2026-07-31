# 0004 — Print Stylesheet

- **Wave:** side-quests / wave_1
- **ADR:** [0001 — Mandarin Character Bingo Generator](../../../adrs/side_quests/0001_mandarin_bingo_generator.md) (Print)
- **Depends on:** [0003_mandarin_bingo_ui](./0003_mandarin_bingo_ui.md)

## Goal

Make **Print** produce a clean paper board via the browser print dialog—no PDF library. Printed tiles follow the session **pinyin visibility** toggle (default on; not persisted).

## Behavior

- Print button calls `window.print()` (injectable wrapper OK for tests).
- Prefer **disable Print** until at least one playable character cell is filled (partial boards may print).
- **Pinyin on paper:** match `showPinyinOnBoard`. Never print English. Hide vocabulary list and actions (`.bingo-no-print`).

## CSS requirements

```css
@media print {
  .bingo-no-print {
    display: none !important;
  }
}
```

Checklist: board borders legible; empty cells blank; FREE labeled; no English; chrome hidden.

## Acceptance criteria

- [ ] `window.print()`; chrome hidden; pinyin follows toggle; no PDF dependency.

## Manual verification

- Desktop print preview once; toggle on/off; FREE visible.

## Out of scope

- Server-side PDF / headless print pipelines.
