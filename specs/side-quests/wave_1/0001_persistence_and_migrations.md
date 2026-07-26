# 0001 — Persistence and Schema Migrations

- **Wave:** side-quests / wave_1
- **Status:** Completed
- **ADR:** [0001 — Mandarin Character Bingo Generator](../../../adrs/side_quests/0001_mandarin_bingo_generator.md) (Persistence schema and migrations)
- **Depends on:** [0000_domain_types_and_preset](./0000_domain_types_and_preset.md)

## Goal

Implement load / save / reset for the working vocabulary using a **versioned `localStorage` envelope**. Persist **`excludedByUser`**, **`label`**, and timestamps with each entry. Do **not** persist board layout, the pinyin toggle, or Active labels.

## Placement

```text
src/app/components/side-quests/mandarin-bingo/
  mandarin-bingo-storage.ts
  mandarin-bingo-migrations.ts
```

Keep migrators **pure** (no `localStorage`) for easy unit tests.

## Envelope shape

```ts
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

**Not persisted:** board cells; `showPinyinOnBoard`; `activeLabels`.

## Public behavior

### `loadCharacterList(): MandarinBingoCharacterListEnvelope`

1. Read `localStorage.getItem(STORAGE_KEY)`.
2. **Missing** → cloned preset envelope (`schemaVersion: CURRENT`); prefer **lazy write** until first mutate/reset.
3. **Corrupt / non-object** → fall back to preset (optionally `removeItem`).
4. If `schemaVersion > CURRENT` → fall back to preset (no downgrade).
5. If `schemaVersion < CURRENT` → `migrate` → **write back** → return.
6. If `schemaVersion === CURRENT` → light-validate entries; on failure fall back to preset.

Light validation: non-empty `id`, `character`, `pinyin`, `translation`; `source` ∈ `{preset,custom}`; `excludedByUser` is boolean; `label` is string; `createdAt`/`modifiedAt` are non-empty strings when present, with safe defaults for missing timestamps/label on otherwise valid rows. **No legacy alias** for `excluded` — presence of only `excluded` (without `excludedByUser`) is invalid → fallback.

### `saveCharacterList(envelope): void`

- `JSON.stringify` under the storage key with `schemaVersion: CURRENT`.

### `resetCharacterList(): MandarinBingoCharacterListEnvelope`

- **Full factory restore:** cloned verified preset (all `excludedByUser: false`, `source: 'preset'` only); write storage; return envelope.
- UI must confirm before calling (see [0003](./0003_mandarin_bingo_ui.md)); this function itself performs the restore.

### Migrations

```ts
function migrate(input: { schemaVersion: number; entries: unknown }): MandarinBingoCharacterListEnvelope
```

- Structure for a future chain even if v1→v1 is identity.
- Preserve `id`s across bumps; do not auto-merge newly shipped preset rows into saved lists.

### Branch wipe note

Because schemaVersion stays 1 while fields changed, testers must clear `mandarin-bingo:character-list` (see ADR 0001 wipe steps).

## Acceptance criteria

- [ ] Load/save/reset honor envelope including `excludedByUser`, `label`, timestamps.
- [ ] Board, pinyin toggle, and Active labels are never written to `localStorage`.
- [ ] Corrupt / newer-than-supported / legacy `excluded`-only → preset fallback.
- [ ] Migrators unit-testable without TestBed ([0006](./0006_unit_test_plan.md)).

## Out of scope

- Board generation/print; IndexedDB; cross-device sync; soft-migrate of `excluded`.
