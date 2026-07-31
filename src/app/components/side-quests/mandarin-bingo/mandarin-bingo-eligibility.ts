/**
 * Pure eligibility helpers for Active labels + excludedByUser (wave_1 spec 0008).
 */

import { MandarinBingoEntry } from './mandarin-bingo.types';

/**
 * Reports whether a vocabulary label is currently in the Active labels include-set.
 *
 * @param label - Entry label; empty string means Unlabeled.
 * @param activeLabels - Session include-set of labels in play.
 * @returns True when the label is active.
 */
export function labelIsActive(
  label: string,
  activeLabels: ReadonlySet<string>,
): boolean {
  return activeLabels.has(label);
}

/**
 * Two-layer eligibility: Active label gate and sticky user bench.
 *
 * @param entry - Vocabulary row to evaluate.
 * @param activeLabels - Session include-set of labels in play.
 * @returns True when the entry may be placed or used in fill pools.
 */
export function isEligible(
  entry: MandarinBingoEntry,
  activeLabels: ReadonlySet<string>,
): boolean {
  return labelIsActive(entry.label, activeLabels) && !entry.excludedByUser;
}

/**
 * Counts eligible entries for the header `x` in `x/n`.
 *
 * @param entries - Full working vocabulary list.
 * @param activeLabels - Session include-set of labels in play.
 * @returns Number of eligible rows.
 */
export function countEligible(
  entries: readonly MandarinBingoEntry[],
  activeLabels: ReadonlySet<string>,
): number {
  return entries.filter((entry) => isEligible(entry, activeLabels)).length;
}

/**
 * Collects unique labels present among entries, sorting unlabeled last for UI menus.
 *
 * @param entries - Full working vocabulary list.
 * @returns Distinct labels; empty string (Unlabeled) appears last when present.
 */
export function collectLabels(entries: readonly MandarinBingoEntry[]): string[] {
  const labels = new Set<string>();

  for (const entry of entries) {
    labels.add(entry.label);
  }

  const labeled = [...labels].filter((label) => label !== '').sort((a, b) =>
    a.localeCompare(b),
  );

  if (labels.has('')) {
    labeled.push('');
  }

  return labeled;
}

/**
 * Builds the default session Active labels set: every label currently present.
 *
 * @param entries - Full working vocabulary list.
 * @returns A mutable Set containing every distinct label among entries.
 */
export function createDefaultActiveLabels(
  entries: readonly MandarinBingoEntry[],
): Set<string> {
  return new Set(collectLabels(entries));
}

/**
 * Collects reserved labels (any label used by preset-class rows).
 *
 * @param entries - Full working vocabulary list.
 * @returns Set of labels that custom entries must not use.
 */
export function collectReservedLabels(
  entries: readonly MandarinBingoEntry[],
): Set<string> {
  const reserved = new Set<string>();

  for (const entry of entries) {
    if (entry.source === 'preset') {
      reserved.add(entry.label);
    }
  }

  return reserved;
}

/**
 * Collects existing custom labels for autocomplete (never reserved preset labels).
 *
 * @param entries - Full working vocabulary list.
 * @returns Sorted non-empty custom labels.
 */
export function collectCustomLabels(
  entries: readonly MandarinBingoEntry[],
): string[] {
  const labels = new Set<string>();

  for (const entry of entries) {
    if (entry.source === 'custom' && entry.label !== '') {
      labels.add(entry.label);
    }
  }

  return [...labels].sort((a, b) => a.localeCompare(b));
}

/**
 * Validates a candidate custom label against length and reserved-label rules.
 *
 * @param label - Trimmed candidate label (empty string allowed for Unlabeled).
 * @param reservedLabels - Labels owned by preset-class rows.
 * @param maxLength - Maximum allowed length for non-empty labels.
 * @returns Null when valid; otherwise a short user-facing error message.
 */
export function validateCustomLabel(
  label: string,
  reservedLabels: ReadonlySet<string>,
  maxLength: number,
): string | null {
  if (label.length > maxLength) {
    return `Label must be at most ${maxLength} characters.`;
  }

  if (label !== '' && reservedLabels.has(label)) {
    return `“${label}” is reserved for preset vocabulary.`;
  }

  return null;
}
