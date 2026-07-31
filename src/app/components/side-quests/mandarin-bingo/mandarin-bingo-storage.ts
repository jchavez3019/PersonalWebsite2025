/**
 * localStorage load/save/reset for the Mandarin bingo vocabulary envelope.
 */

import { MANDARIN_BINGO_STORAGE_KEY } from './mandarin-bingo.constants';
import {
  createPresetEnvelope,
  migrateMandarinBingoEnvelope,
  validateEntries,
} from './mandarin-bingo-migrations';
import {
  CURRENT_SCHEMA_VERSION,
  MandarinBingoCharacterListEnvelope,
} from './mandarin-bingo.types';

/**
 * Minimal Storage surface used by load/save helpers (real localStorage or test doubles).
 */
export type MandarinBingoStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/**
 * Loads the vocabulary envelope, migrating or falling back to the preset as needed.
 *
 * @param storage - Key/value store to read from; defaults to browser localStorage.
 * @returns A validated CURRENT-schema envelope. Missing, corrupt, or unsupported saves yield the preset.
 */
export function loadCharacterList(
  storage: MandarinBingoStorage = localStorage,
): MandarinBingoCharacterListEnvelope {
  const raw = storage.getItem(MANDARIN_BINGO_STORAGE_KEY);

  if (raw === null) {
    return createPresetEnvelope();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    storage.removeItem(MANDARIN_BINGO_STORAGE_KEY);
    return createPresetEnvelope();
  }

  if (parsed === null || typeof parsed !== 'object') {
    storage.removeItem(MANDARIN_BINGO_STORAGE_KEY);
    return createPresetEnvelope();
  }

  const record = parsed as Record<string, unknown>;
  const schemaVersion = record['schemaVersion'];
  const entries = record['entries'];

  if (typeof schemaVersion !== 'number') {
    storage.removeItem(MANDARIN_BINGO_STORAGE_KEY);
    return createPresetEnvelope();
  }

  if (schemaVersion > CURRENT_SCHEMA_VERSION) {
    return createPresetEnvelope();
  }

  if (schemaVersion < CURRENT_SCHEMA_VERSION) {
    try {
      const migrated = migrateMandarinBingoEnvelope({
        schemaVersion,
        entries,
      });
      saveCharacterList(migrated, storage);
      return migrated;
    } catch {
      storage.removeItem(MANDARIN_BINGO_STORAGE_KEY);
      return createPresetEnvelope();
    }
  }

  const validated = validateEntries(entries);
  if (validated === null) {
    storage.removeItem(MANDARIN_BINGO_STORAGE_KEY);
    return createPresetEnvelope();
  }

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    entries: validated,
  };
}

/**
 * Persists the vocabulary envelope under the Mandarin bingo storage key.
 *
 * @param envelope - CURRENT-schema envelope to serialize.
 * @param storage - Key/value store to write to; defaults to browser localStorage.
 */
export function saveCharacterList(
  envelope: MandarinBingoCharacterListEnvelope,
  storage: MandarinBingoStorage = localStorage,
): void {
  storage.setItem(MANDARIN_BINGO_STORAGE_KEY, JSON.stringify(envelope));
}

/**
 * Performs a full factory restore to the verified preset and writes it to storage.
 *
 * @param storage - Key/value store to write to; defaults to browser localStorage.
 * @returns The newly written preset envelope (all exclusions cleared, customs removed).
 */
export function resetCharacterList(
  storage: MandarinBingoStorage = localStorage,
): MandarinBingoCharacterListEnvelope {
  const envelope = createPresetEnvelope();
  saveCharacterList(envelope, storage);
  return envelope;
}
