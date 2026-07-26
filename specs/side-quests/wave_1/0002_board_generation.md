# 0002 — Board Generation and Preset Vocabulary

- **Wave:** side-quests / wave_1
- **ADR:** [0001 — Mandarin Character Bingo Generator](../../../adrs/side_quests/0001_mandarin_bingo_generator.md) (Board rules; Fisher–Yates)
- **Depends on:** [0000_domain_types_and_preset](./0000_domain_types_and_preset.md)

## Goal

1. Lock the **canonical traditional Mandarin preset** (verified; encode in `mandarin-bingo.preset.ts`).
2. Provide pure board helpers: empty board, place entry, clear cell, and **Fisher–Yates** fill of remaining empty cells from the **non-excluded** unused pool.

## Placement

```text
src/app/components/side-quests/mandarin-bingo/mandarin-bingo-board.ts
src/app/components/side-quests/mandarin-bingo/mandarin-bingo.preset.ts
```

## Preset vocabulary (Traditional Chinese) — verified

Canonical teaching set (owner-verified). Encode exactly:

| # | Traditional | Pinyin | English |
|---|---|---|---|
| 1 | 這 | zhè | this |
| 2 | 朋友 | péngyǒu | friend |
| 3 | 認識 | rènshí | to know, meet, recognize |
| 4 | 高興 | gāoxìng | happy, glad |
| 5 | 平常 | píngcháng | usually, normally |
| 6 | 住在 | zhù zài | to live in/at |
| 7 | 現在 | xiànzài | now |
| 8 | 學校 | xuéxiào | school |
| 9 | 放假 | fàngjià | to be on school break, to be on vacation |
| 10 | 來 | lái | to come |
| 11 | 玩 | wán | to have fun, to play |
| 12 | 歡迎 | huānyíng | to welcome |
| 13 | 想 | xiǎng | would like, to want, to have a desire to |
| 14 | 去 | qù | to go |
| 15 | 國家 | guójiā | nation, country |
| 16 | 公園 | gōngyuán | park |
| 17 | 好久不見 | hǎojiǔ bújiàn | long time no see |
| 18 | 迪士尼樂園 | Díshìní lèyuán | Disneyland |
| 19 | 臺北 | Táiběi | Taipei |
| 20 | 加州 | Jiāzhōu | California |
| 21 | 誰 | shéi | who, whom |
| 22 | 父母 | fùmǔ | parents (formal) |
| 23 | 每天 | měitiān | every day |
| 24 | 老師 | lǎoshī | teacher |

Preset length is **exactly 24**. Each preset row ships with `source: 'preset'`, `excluded: false`, and a stable UUID. Custom entries expand the pool when not excluded.

## Cell model

```ts
export type MandarinBingoCell =
  | { kind: 'free' }
  | { kind: 'empty' }
  | { kind: 'character'; entry: MandarinBingoEntry };

export type MandarinBingoBoard = MandarinBingoCell[]; // length 25; index 12 === free
```

English is never required for board rendering.

## APIs

### Empty board

```ts
export function createEmptyBoard(): MandarinBingoBoard;
```

- Index `12` → `{ kind: 'free' }`; other indices → `{ kind: 'empty' }`.

### Place entry

```ts
export type PlaceEntryResult =
  | { ok: true; board: MandarinBingoBoard }
  | {
      ok: false;
      reason:
        | 'cell_not_empty'
        | 'cell_is_free'
        | 'duplicate_entry'
        | 'entry_excluded'
        | 'invalid_index';
    };

export function placeEntryOnBoard(
  board: MandarinBingoBoard,
  cellIndex: number,
  entry: MandarinBingoEntry,
): PlaceEntryResult;
```

- Reject FREE, occupied, out-of-range, duplicate `id` on board, or `entry.excluded === true`.

### Clear cell / clear entry from board

```ts
export function clearBoardCell(board: MandarinBingoBoard, cellIndex: number): PlaceEntryResult;
export function clearEntryFromBoard(board: MandarinBingoBoard, entryId: string): MandarinBingoBoard;
```

- `clearBoardCell`: character → empty; never clears FREE.
- `clearEntryFromBoard`: used when an entry is **excluded** while placed — clear every cell with that `id`.

### Fill remaining (Fisher–Yates)

```ts
export type FillBoardResult =
  | { ok: true; board: MandarinBingoBoard }
  | {
      ok: false;
      reason: 'insufficient_entries';
      required: number;
      actual: number;
    };

export function fillRemainingBingoCells(
  board: MandarinBingoBoard,
  entries: MandarinBingoEntry[],
  rng?: () => number,
): FillBoardResult;
```

```text
1. emptyIndices = playable indices with kind === 'empty'
2. usedIds = ids on character cells
3. pool = entries where !excluded && id not in usedIds (clone)
4. if pool.length < emptyIndices.length → insufficient_entries
5. Fisher–Yates shuffle pool (ADR)
6. place pool[0 .. emptyCount-1] onto emptyIndices
```

### Full regenerate

```ts
export function generateBingoBoard(
  entries: MandarinBingoEntry[],
  rng?: () => number,
): FillBoardResult;
```

- `fillRemainingBingoCells(createEmptyBoard(), entries, rng)`.

Complexity: time \(\Theta(n)\), extra storage \(\Theta(n)\) for pool clone (ADR).

## Rules checklist

- FREE center immutable; no duplicate ids; excluded never placed or filled.
- Partial boards: place + fill remaining; session-only (not persisted).
- Insufficient eligible pool → clear failure (no filler cells).

## Acceptance criteria

- [ ] Preset matches the verified table (24 rows).
- [ ] Place rejects excluded; fill skips excluded; `clearEntryFromBoard` supports exclude-while-placed.
- [ ] Fisher–Yates used for random fill of empty cells only.

## Out of scope

- Daubing / caller mode; persisting board layout; English on tiles.
