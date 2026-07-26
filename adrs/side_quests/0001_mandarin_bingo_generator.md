# 0001 — Mandarin Character Bingo Generator

- **Status:** Proposed
- **Date:** 2026-07-26
- **Amended:** 2026-07-30 (vocabulary touch-ups: Class/Label, eligibility layers, edit/sort/board move)

## Context

The first Side Quest is a Mandarin character bingo board generator: a shareable, printable 5×5 board for practicing traditional hanzi. It is intentionally unrelated to career/research portfolio work, which is why it lives under Side Quests ([0000](./0000_side_quests_tab.md)) rather than Projects.

Product requirements (including grill refinements and vocabulary touch-ups):

- Curated **traditional** preset with character, toned pinyin, and English translation; all preset rows share label **`Lesson 5`**.
- Vocabulary list shows character, pinyin, English, **Class** (Preset/Custom), **Label**, and Exclude.
- Board tiles show character and optional pinyin (never English); pinyin visibility is toggleable.
- Users can **add/edit** custom entries; **exclude** any entry from the fill pool via `excludedByUser`; **delete** only custom entries.
- **Active labels** (session-only) gate which labels are in play; eligibility is two-layered (see Character list).
- Users may **place**, **move**, **swap**, and **remove** entries on the board (drag + required non-drag fallback) and **randomly fill** remaining empty cells.
- Board geometry is **5×5** with the **center cell free**.
- Seamless **print** via the browser print dialog.

The site already hosts interactive front-ends as routed components (for example `/toy-agentic-framework-v0` under `hosted_projects/`). This quest needs its own chrome and must not be embedded in the Side Quests tab body.

## Decision

### Placement

Ship a pure client-side Angular mini-app under `src/app/components/side-quests/` (e.g. `side-quests/mandarin-bingo/`), registered in `app.routes.ts` at `side-quests/mandarin-bingo`.

Link it from the Side Quests listing via the catalog field **`router_link`**. No backend, API, or auth.

### Board rules

- Fixed **5×5** grid (25 cells). Playable cells may be `empty` or `character`; center is always **FREE**.
- Character cells: traditional hanzi centered; pinyin directly below **when** the session pinyin toggle is on.
- **Never** show English on the board.
- Manual placement: drag (where supported) **and** a required select-then-tap (or equivalent) fallback for touch/narrow viewports.
- Board move: select/drag a filled cell; drop on empty = move; drop on occupied = **swap**; drag/click off board = **remove**.
- Drag ghost is **tile-sized** (hanzi + optional pinyin), not the full vocab row.
- **Fill remaining:** Fisher–Yates over the pool of **eligible** entries whose ids are not already on the board; only `{ kind: 'empty' }` cells are filled. Full regenerate = empty board then fill all 24.
- Guard: unused eligible pool must be large enough for the number of empty cells; otherwise surface a clear error.
- **Session-only board:** board layout is **not** persisted. On load, start from `createEmptyBoard()`. Only the vocabulary envelope uses `localStorage`.

### Board entry selection: Fisher–Yates shuffle

Bingo needs a **uniform random sample without replacement** over the eligible unused pool. The **Fisher–Yates** algorithm (modern / Knuth variant) produces a **uniform random permutation**—every ordering of the pool has equal probability. Taking enough leading elements to fill empty cells is uniform sampling without replacement.

Prefer Fisher–Yates over flawed shortcuts such as sorting by `Math.random()` (not uniform over permutations).

#### Algorithm (modern Fisher–Yates on a copy of the eligible pool)

1. Build `pool` = working entries where the entry is **eligible** and `id` is not already on a character cell; clone it.
2. Let `n = pool.length`. For \(i\) from \(n - 1\) down to \(1\): draw \(j\) uniformly from \(\{0,\ldots,i\}\); swap `pool[i]` and `pool[j]`.
3. Assign `pool[0 .. emptyCount-1]` onto empty playable indices (never the FREE center).

Optional: inject `rng` for deterministic tests; production uses `Math.random()` (or a thin wrapper).

#### Complexity

Let \(n\) be the eligible pool size.

| Resource | Bound | Notes |
|---|---|---|
| **Time** | \(\Theta(n)\) | One Fisher–Yates pass; board writes are \(O(1)\) in board size (≤24). |
| **Extra storage** | \(\Theta(n)\) | Clone the pool before shuffling so the persisted vocabulary order is not mutated. |

### Character list (vocabulary)

- **Orthography:** traditional Chinese; toned pinyin; English `translation` on every entry.
- Entry shape:

```ts
{
  id, character, pinyin, translation,
  source: 'preset' | 'custom',  // Class
  label: string,                // "" = unlabeled; presets "Lesson 5"
  excludedByUser: boolean,
  createdAt: string,            // ISO
  modifiedAt: string            // ISO
}
```

- Canonical preset (24 rows) is locked in wave_1 spec [0002](../../specs/side-quests/wave_1/0002_board_generation.md) (verified); all rows use label **`Lesson 5`**.
- **Eligibility (two layers):**

```text
eligible = labelIsActive(label) && !excludedByUser
```

- **Active labels:** session-only include-set of labels currently in play. On load/refresh = all labels present among entries. **Not persisted.** Deactivate/reactivate mutates only this set — never mass-writes `excludedByUser`.
- **`excludedByUser`:** sticky persisted user bench. Survives Active-label reactivate.
- **Option A:** when a word’s label is inactive, Exclude looks checked/disabled; uncheck is **blocked** (prompt to re-enable the label). Do not silently re-add the label.
- **UI — list:** show all rows (including ineligible), with character, pinyin, English, Class, Label, edit (custom), delete (custom), Exclude. Ineligible rows stay visible but dimmed. Header shows **`x/n`** (eligible / total), Sort, and Active labels.
- **Exclude:** allowed for preset and custom when the label is active. Persisted as `excludedByUser`. Ineligible entries are omitted from fill/generate/place pools and cannot be newly placed. If an entry already on the board becomes ineligible, **fade those board cells off**.
- **Delete:** **custom only**. Preset rows are never deleted (only excluded / labeled inactive).
- **Add/edit custom:** MatDialog + reactive form (character, pinyin, translation, optional label). Reserved labels = any label on preset-class rows (today `"Lesson 5"`); customs cannot use them. Autocomplete suggests custom labels only. On save: update `modifiedAt`, persist, MatSnackBar “Saved”.
- **Reset to preset:** **full factory restore** after a **confirmation dialog** that warns custom entries will be permanently deleted: working list becomes the shipped preset (all `excludedByUser: false`), customs removed, session board cleared, session Active labels reset to all preset labels.

### Persistence schema and migrations

Persist **only** the vocabulary envelope in `localStorage` (not the board, not the pinyin toggle, not Active labels).

```ts
// Example key: "mandarin-bingo:character-list"
{
  schemaVersion: 1,
  entries: [
    {
      id: "...",
      character: "這",
      pinyin: "zhè",
      translation: "this",
      source: "preset",
      label: "Lesson 5",
      excludedByUser: false,
      createdAt: "...",
      modifiedAt: "..."
    }
  ]
}
```

- **`schemaVersion`:** stays **1** for this branch touch-up (no bump). Extended entry fields are required on load.
- **`id`:** stable UUID across schema bumps.
- **No legacy alias:** old `excluded` (without `excludedByUser`) fails validation → fall back to preset. Testers must wipe localStorage (see below).
- **Load path:** missing → preset; corrupt → preset; newer than supported → preset (no downgrade); older → migrate chain and write back.
- **Preset updates vs migrations:** shipping new default characters does not auto-merge into saved lists; user must Reset. Migrations only rewrite shape/fields.
- **Session UI state (not in envelope):** board layout; `showPinyinOnBoard` (default `true` each load); `activeLabels`; sort preference.
- **Future media:** prefer `audioSrc`-style URLs later; no binary blobs in this envelope.
- **Tests:** fixture-backed migrators and load fallbacks (see wave_1 specs 0006 / 0008 / 0009).

### Clearing stale localStorage (branch testers)

Key: `mandarin-bingo:character-list` on origin `http://localhost:4200`.

1. Open the app on localhost; DevTools → **Application** → **Local Storage** → `http://localhost:4200`.
2. Delete `mandarin-bingo:character-list` (or Clear for that origin).
3. Hard refresh.

Also acceptable: `localStorage.removeItem('mandarin-bingo:character-list')` in the console.

### Print

- Explicit **Print** via `window.print()` + `@media print`.
- Printed tiles follow the session pinyin toggle; never print English; hide list/actions chrome.
- No PDF library in v1.

### UX shape

1. Vocabulary list (full deck, Class/Label, exclude/delete/edit rules, add, sort, Active labels, reset-with-confirm).
2. Actions: fill remaining / generate, clear board, pinyin toggle, print.
3. Board preview (place + move/swap/remove + empty targets + FREE center).

Visual language stays consistent with the existing Angular Material site.

## Consequences

### Positive

- Deep-linkable mini-app; no backend.
- Vocabulary + `excludedByUser` preferences survive refresh; board and Active labels stay simple (session-only).
- Exclude-without-delete protects the teaching preset while allowing classroom trimming; Active labels batch by lesson without wiping sticky benches.
- Partial fill + placement + move/swap supports customized boards; Fisher–Yates keeps randomness correct.
- Versioned envelope supports future additive fields (e.g. audio metadata).

### Negative / trade-offs

- `localStorage` is per-browser/device.
- Board, pinyin toggle, and Active labels reset on refresh (Active labels re-open all present labels).
- Eligible pool below empty-cell count blocks fill until the user includes more entries or adds customs.
- Historical migrators must be retained while old schema versions may exist.
- Confirm-on-reset is required so factory restore does not silently wipe customs.
- Branch testers must wipe localStorage when entry shape changes without a schema bump.

### Non-goals (v1)

- Online multiplayer or caller / ball-draw host UI.
- Tone quizzes, SRS, PDF libraries, account-backed decks.
- Embedding the generator in the Side Quests tab `ngSwitch` body.
- Binary audio in `localStorage`; auto-merge of new preset rows into saved lists.
- Deleting preset vocabulary rows.
- Persisting board layout, the pinyin visibility toggle, or Active labels.
- Soft-migrating legacy `excluded` → `excludedByUser` (wipe instead).
- S3/CloudFront deploy as part of the implementation milestone (owner publishes manually).
