/**
 * Pure schema migration chain for Mandarin bingo vocabulary envelopes.
 */

import {
  PRESET_CREATED_AT,
  PRESET_LABEL,
  PRESET_MODIFIED_AT,
} from './mandarin-bingo.constants';
import { cloneMandarinBingoPreset } from './mandarin-bingo.preset';
import {
  CURRENT_SCHEMA_VERSION,
  MandarinBingoCharacterListEnvelope,
  MandarinBingoEntry,
  MandarinBingoEntrySource,
} from './mandarin-bingo.types';

/**
 * Migrates a parsed envelope toward CURRENT_SCHEMA_VERSION.
 *
 * For v1 shipping this is effectively identity once the payload is valid v1.
 * Future schema bumps should apply stepwise upgrades before validation.
 *
 * @param input - Raw envelope fragments with a numeric schemaVersion and unknown entries payload.
 * @returns A validated envelope at CURRENT_SCHEMA_VERSION.
 * @throws Error when no migration path exists or entries fail CURRENT validation.
 */
export function migrateMandarinBingoEnvelope(input: {
  schemaVersion: number;
  entries: unknown;
}): MandarinBingoCharacterListEnvelope {
  const version = input.schemaVersion;
  const entries = input.entries;

  // Future bumps: apply stepwise upgrades while version < CURRENT.
  if (version !== CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `No migration path from schemaVersion ${version} to ${CURRENT_SCHEMA_VERSION}`,
    );
  }

  const validated = validateEntries(entries);
  if (validated === null) {
    throw new Error('Invalid entries after migration');
  }

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    entries: validated,
  };
}

/**
 * Builds a factory-default envelope from the verified traditional preset.
 *
 * @returns A CURRENT-schema envelope whose entries are a deep clone of the shipped preset.
 */
export function createPresetEnvelope(): MandarinBingoCharacterListEnvelope {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    entries: cloneMandarinBingoPreset(),
  };
}

/**
 * Light-validates an unknown payload as CURRENT-schema vocabulary entries.
 *
 * Requires `excludedByUser`. Defaults missing
 * `label` / timestamps when the rest of the row is valid.
 *
 * @param entries - Candidate entries array from storage or a migration step.
 * @returns A typed entry array when every row is valid; otherwise null.
 */
export function validateEntries(entries: unknown): MandarinBingoEntry[] | null {
  if (!Array.isArray(entries)) {
    return null;
  }

  const result: MandarinBingoEntry[] = [];

  for (const raw of entries) {
    if (raw === null || typeof raw !== 'object') {
      return null;
    }

    const row = raw as Record<string, unknown>;
    const id = row['id'];
    const character = row['character'];
    const pinyin = row['pinyin'];
    const translation = row['translation'];
    const source = row['source'];
    const excludedByUser = row['excludedByUser'];

    // Reject legacy excluded-only payloads so branch testers wipe storage.
    if (typeof excludedByUser !== 'boolean') {
      return null;
    }

    if (typeof id !== 'string' || id.length === 0) {
      return null;
    }

    if (typeof character !== 'string' || character.length === 0) {
      return null;
    }

    if (typeof pinyin !== 'string' || pinyin.length === 0) {
      return null;
    }

    if (typeof translation !== 'string' || translation.length === 0) {
      return null;
    }

    if (source !== 'preset' && source !== 'custom') {
      return null;
    }

    const label =
      typeof row['label'] === 'string'
        ? row['label']
        : source === 'preset'
          ? PRESET_LABEL
          : '';

    const createdAt =
      typeof row['createdAt'] === 'string' && row['createdAt'].length > 0
        ? row['createdAt']
        : PRESET_CREATED_AT;

    const modifiedAt =
      typeof row['modifiedAt'] === 'string' && row['modifiedAt'].length > 0
        ? row['modifiedAt']
        : PRESET_MODIFIED_AT;

    result.push({
      id,
      character,
      pinyin,
      translation,
      source: source as MandarinBingoEntrySource,
      label,
      excludedByUser,
      createdAt,
      modifiedAt,
    });
  }

  return result;
}
