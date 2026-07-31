/**
 * Session vocabulary sort helpers for the Mandarin bingo list.
 */

import { MandarinBingoEntry } from './mandarin-bingo.types';

/**
 * Supported sort keys for the vocabulary list header menu.
 */
export type VocabSortKey =
  | 'created'
  | 'modified'
  | 'pinyin'
  | 'english'
  | 'label';

/**
 * Sort direction for the vocabulary list.
 */
export type VocabSortDirection = 'asc' | 'desc';

/**
 * Returns a shallow-sorted copy of entries for the current sort preference.
 *
 * Unlabeled rows (`label === ''`) sort last for label sorts.
 * Presets use fixed shipped timestamps so modified-desc naturally ranks customs first.
 *
 * @param entries - Working vocabulary list.
 * @param key - Field to sort by.
 * @param direction - Ascending or descending order.
 * @returns A new array with entries ordered per the key/direction.
 */
export function sortVocabularyEntries(
  entries: readonly MandarinBingoEntry[],
  key: VocabSortKey,
  direction: VocabSortDirection,
): MandarinBingoEntry[] {
  const factor = direction === 'asc' ? 1 : -1;
  const copy = entries.slice();

  copy.sort((a, b) => {
    const cmp = compareEntries(a, b, key);
    if (cmp !== 0) {
      return cmp * factor;
    }

    // Stable tie-break by character then id.
    const byCharacter = a.character.localeCompare(b.character);
    if (byCharacter !== 0) {
      return byCharacter;
    }

    return a.id.localeCompare(b.id);
  });

  return copy;
}

/**
 * Compares two entries for the given sort key (ascending semantics).
 *
 * @param a - Left entry.
 * @param b - Right entry.
 * @param key - Sort field.
 * @returns Negative when a < b, positive when a > b, zero when equal.
 */
function compareEntries(
  a: MandarinBingoEntry,
  b: MandarinBingoEntry,
  key: VocabSortKey,
): number {
  switch (key) {
    case 'created':
      return a.createdAt.localeCompare(b.createdAt);
    case 'modified':
      return a.modifiedAt.localeCompare(b.modifiedAt);
    case 'pinyin':
      return a.pinyin.localeCompare(b.pinyin, undefined, { sensitivity: 'base' });
    case 'english':
      return a.translation.localeCompare(b.translation, undefined, {
        sensitivity: 'base',
      });
    case 'label':
      return compareLabels(a.label, b.label);
    default:
      return 0;
  }
}

/**
 * Compares labels with unlabeled (`""`) sorting after all named labels.
 *
 * @param a - Left label.
 * @param b - Right label.
 * @returns Negative when a < b under unlabeled-last rules.
 */
function compareLabels(a: string, b: string): number {
  if (a === '' && b === '') {
    return 0;
  }

  if (a === '') {
    return 1;
  }

  if (b === '') {
    return -1;
  }

  return a.localeCompare(b);
}
