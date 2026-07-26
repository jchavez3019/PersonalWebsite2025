/**
 * Storage and migration load-path tests with an in-memory localStorage mock.
 */
import { MANDARIN_BINGO_STORAGE_KEY, PRESET_LABEL } from './mandarin-bingo.constants';
import { createPresetEnvelope, migrateMandarinBingoEnvelope, validateEntries } from './mandarin-bingo-migrations';
import {
  loadCharacterList,
  MandarinBingoStorage,
  resetCharacterList,
  saveCharacterList,
} from './mandarin-bingo-storage';
import { CURRENT_SCHEMA_VERSION } from './mandarin-bingo.types';

class MemoryStorage implements MandarinBingoStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }
}

describe('mandarin-bingo-storage', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('test_load_returns_preset_when_storage_is_empty', () => {
    /**
     * Given empty storage
     * When loadCharacterList runs
     * Then the verified preset envelope is returned
     */
    const envelope = loadCharacterList(storage);
    expect(envelope.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(envelope.entries.length).toBe(24);
    expect(envelope.entries.every((e) => e.label === PRESET_LABEL)).toBeTrue();
  });

  it('test_load_round_trips_excludedByUser_flag', () => {
    /**
     * Given a saved envelope with an excludedByUser entry
     * When loadCharacterList runs
     * Then excludedByUser remains true
     */
    const envelope = createPresetEnvelope();
    envelope.entries[0] = { ...envelope.entries[0], excludedByUser: true };
    saveCharacterList(envelope, storage);

    const loaded = loadCharacterList(storage);
    expect(loaded.entries[0].excludedByUser).toBeTrue();
  });

  it('test_load_falls_back_to_preset_when_json_is_corrupt', () => {
    /**
     * Given corrupt JSON in storage
     * When loadCharacterList runs
     * Then the preset is returned
     */
    storage.setItem(MANDARIN_BINGO_STORAGE_KEY, '{not-json');
    const loaded = loadCharacterList(storage);
    expect(loaded.entries.length).toBe(24);
  });

  it('test_load_falls_back_to_preset_when_schema_version_is_newer_than_supported', () => {
    /**
     * Given a future schemaVersion
     * When loadCharacterList runs
     * Then the preset is returned without downgrade
     */
    storage.setItem(
      MANDARIN_BINGO_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, entries: [] }),
    );
    const loaded = loadCharacterList(storage);
    expect(loaded.entries.length).toBe(24);
  });

  it('test_load_falls_back_when_legacy_excluded_alias_is_present_without_excludedByUser', () => {
    /**
     * Given a v1-shaped payload that only has legacy excluded
     * When validateEntries / load runs
     * Then validation fails and load falls back to preset
     */
    expect(
      validateEntries([
        {
          id: 'legacy-1',
          character: '這',
          pinyin: 'zhè',
          translation: 'this',
          source: 'preset',
          excluded: false,
        },
      ]),
    ).toBeNull();

    storage.setItem(
      MANDARIN_BINGO_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        entries: [
          {
            id: 'legacy-1',
            character: '這',
            pinyin: 'zhè',
            translation: 'this',
            source: 'preset',
            excluded: false,
          },
        ],
      }),
    );
    const loaded = loadCharacterList(storage);
    expect(loaded.entries.length).toBe(24);
    expect(loaded.entries[0].excludedByUser).toBeFalse();
  });

  it('test_reset_restores_preset_and_clears_customs', () => {
    /**
     * Given a list with a custom entry
     * When resetCharacterList runs
     * Then only the preset remains
     */
    const envelope = createPresetEnvelope();
    envelope.entries.push({
      id: 'custom-1',
      character: '測',
      pinyin: 'cè',
      translation: 'test',
      source: 'custom',
      label: 'Homework',
      excludedByUser: false,
      createdAt: '2026-07-01T00:00:00.000Z',
      modifiedAt: '2026-07-01T00:00:00.000Z',
    });
    saveCharacterList(envelope, storage);

    const reset = resetCharacterList(storage);
    expect(reset.entries.length).toBe(24);
    expect(reset.entries.every((entry) => entry.source === 'preset')).toBeTrue();
    expect(reset.entries.every((entry) => entry.excludedByUser === false)).toBeTrue();
  });

  it('test_migrate_returns_current_schema_for_valid_v1_fixture', () => {
    /**
     * Given a valid v1 envelope
     * When migrateMandarinBingoEnvelope runs
     * Then schemaVersion is CURRENT and ids are preserved
     */
    const migrated = migrateMandarinBingoEnvelope({
      schemaVersion: 1,
      entries: [
        {
          id: 'fixture-1',
          character: '這',
          pinyin: 'zhè',
          translation: 'this',
          source: 'preset',
          label: PRESET_LABEL,
          excludedByUser: false,
          createdAt: '2026-01-01T00:00:00.000Z',
          modifiedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });
    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.entries[0].id).toBe('fixture-1');
    expect(migrated.entries[0].label).toBe(PRESET_LABEL);
  });
});
