# 0008 — Active Labels and Eligibility

- **Wave:** side-quests / wave_1
- **Status:** Completed
- **ADR:** [0001 — Mandarin Character Bingo Generator](../../../adrs/side_quests/0001_mandarin_bingo_generator.md)
- **Depends on:** [0000_domain_types_and_preset](./0000_domain_types_and_preset.md)

## Goal

Codify the two-layer eligibility model: session **Active labels** (include-set) plus persisted **`excludedByUser`**. Drive `x/n`, list dimming, fill/place pools, and board fade-out.

## Terminology

| Term | Meaning |
|---|---|
| Class | `Preset` / `Custom` (`source`). Not in Active labels. |
| Label | Grouping string; presets `"Lesson 5"`; customs optional or `""`. |
| Active labels | Session-only include-set of labels in play. |
| `excludedByUser` | Sticky persisted user bench flag. |
| Eligible | `labelIsActive(label) && !excludedByUser` |
| `x/n` | Eligible count / total count |

## Rules

```text
eligible = labelIsActive(label) && !excludedByUser
```

- Exclude checkbox when label **active:** toggles `excludedByUser` only.
- Exclude checkbox when label **inactive:** appears checked/disabled; uncheck is **blocked** (Option A) with a short message — do not silently re-add the label.
- Deactivate / reactivate label L: mutate session `activeLabels` only — **never** mass-write `excludedByUser`.
- Reactivate L: words with `excludedByUser=true` stay benched.
- List always shows full vocabulary; ineligible rows dimmed.
- Board / fill / place: only eligible entries; becoming ineligible → fade off board.
- On load/refresh: `activeLabels` = all labels present among entries. **Not persisted.**
- Empty Active labels → all ineligible; `x=0`; board clears with fade.
- Unlabeled customs use label `""` and Active-labels option **Unlabeled**.

## Helpers (pure)

```ts
labelIsActive(label: string, activeLabels: ReadonlySet<string>): boolean
isEligible(entry, activeLabels): boolean
countEligible(entries, activeLabels): number
collectLabels(entries): string[]
```

## Edge-case matrix (required tests)

See plan edge matrix: deactivate/reactivate preserve `excludedByUser`, Option A, empty set, refresh reset of active labels, unlabeled, reserved labels (covered with 0009), reset to preset.

## Acceptance criteria

- [ ] Eligibility formula and Option A enforced.
- [ ] `activeLabels` session-only; refresh restores all present labels.
- [ ] `x/n` uses eligible / total.
- [ ] Unit tests cover the edge matrix (with 0006/0009).

## Out of scope

- Persisting Active labels; schema version bump; soft-migrate legacy `excluded`.
