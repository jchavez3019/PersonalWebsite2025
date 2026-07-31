# 0000 — Domain Types and Preset Vocabulary

- **Wave:** side-quests / wave_1
- **Status:** Completed
- **ADR:** [0001 — Mandarin Character Bingo Generator](../../../adrs/side_quests/0001_mandarin_bingo_generator.md)
- **Depends on:** none (wave foundation)

## Goal

Define the v1 TypeScript domain model for vocabulary entries and board cells. The **canonical traditional-character preset table** lives in [0002_board_generation](./0002_board_generation.md) (**verified**); implementation encodes that list in `mandarin-bingo.preset.ts`.

## Placement

```text
src/app/components/side-quests/mandarin-bingo/
```

| File | Responsibility |
|---|---|
| `mandarin-bingo.types.ts` | Entry + envelope + cell interfaces, `CURRENT_SCHEMA_VERSION` |
| `mandarin-bingo.preset.ts` | Curated preset from 0002 (traditional hanzi, toned pinyin, English, stable UUIDs, label `Lesson 5`, `excludedByUser: false`) |
| `mandarin-bingo.constants.ts` | Storage key, board size, FREE label copy, preset label / max label length |
| `mandarin-bingo-eligibility.ts` | Pure eligibility helpers (see [0008](./0008_active_labels_and_eligibility.md)) |

## Script and orthography

- **Traditional Chinese** characters; toned pinyin; English `translation` required for the vocabulary panel (never on board tiles).

## Types (schemaVersion 1)

```ts
export type MandarinBingoEntrySource = 'preset' | 'custom';

export interface MandarinBingoEntry {
  id: string;
  character: string;
  pinyin: string;
  translation: string;
  source: MandarinBingoEntrySource; // Class
  label: string;                     // "" = unlabeled; presets "Lesson 5"
  excludedByUser: boolean;
  createdAt: string;                 // ISO
  modifiedAt: string;                // ISO
}

export interface MandarinBingoCharacterListEnvelope {
  schemaVersion: number;
  entries: MandarinBingoEntry[];
  // activeLabels is NOT on the envelope
}

export type MandarinBingoCell =
  | { kind: 'free' }
  | { kind: 'empty' }
  | { kind: 'character'; entry: MandarinBingoEntry };

export type MandarinBingoBoard = MandarinBingoCell[]; // length 25; index 12 is free

export const CURRENT_SCHEMA_VERSION = 1;
```

- Preset rows: stable UUIDs, `source: 'preset'`, `label: 'Lesson 5'`, `excludedByUser: false`, fixed shipped `createdAt`/`modifiedAt`.
- Custom rows: new UUID, `source: 'custom'`, `excludedByUser: false` on add; optional `label`.

## Constants

- Storage key: `mandarin-bingo:character-list`.
- `BOARD_SIZE = 5`, playable cells = 24, center index = 12.
- FREE label constant shared with board helpers.
- Preset label: `Lesson 5`; custom label max length ~15.

## Preset rules

- Exact vocabulary: **verified 24-row table in [0002](./0002_board_generation.md)**.
- Deep-clone for Reset; never mutate the exported constant in place.
- New shipped preset rows do not auto-merge into saved lists (ADR).

## Acceptance criteria

- [ ] Types include `translation`, `source`, `label`, `excludedByUser`, timestamps, envelope, cell/board unions, `CURRENT_SCHEMA_VERSION === 1`.
- [ ] Preset encodes the verified 0002 table (length 24, traditional, toned pinyin, English, UUIDs, `source: 'preset'`, `label: 'Lesson 5'`, `excludedByUser: false`).
- [ ] Constants reused by later specs.

## Out of scope

- Migrations beyond declaring v1; audio fields; Side Quests listing metadata.
