/**
 * Domain types for the Mandarin bingo Side Quest (wave_1 / ADR 0001).
 */

/**
 * Origin of a vocabulary row in the working list (UI Class).
 */
export type MandarinBingoEntrySource = 'preset' | 'custom';

/**
 * Single vocabulary row in the working list.
 */
export interface MandarinBingoEntry {
  /** Stable UUID for the row across sessions and schema migrations. */
  id: string;
  /** Traditional Chinese character or multi-character word. */
  character: string;
  /** Toned pinyin transcription shown in the list and optionally on the board. */
  pinyin: string;
  /** English gloss shown only in the vocabulary list. */
  translation: string;
  /** Whether the row shipped with the app or was added by the user (Class). */
  source: MandarinBingoEntrySource;
  /**
   * Grouping label. Empty string means Unlabeled.
   * Preset rows use the reserved Lesson 5 label.
   */
  label: string;
  /**
   * Sticky user bench flag. When true, the row is ineligible regardless of Active labels.
   * Persisted; not cleared by reactivating a label.
   */
  excludedByUser: boolean;
  /** ISO timestamp when the row was created (fixed for preset). */
  createdAt: string;
  /** ISO timestamp when the row was last edited (fixed for preset). */
  modifiedAt: string;
}

/**
 * Versioned localStorage envelope for the vocabulary list.
 * Active labels are session-only and must not appear here.
 */
export interface MandarinBingoCharacterListEnvelope {
  /** Monotonic schema version used to drive migrations. */
  schemaVersion: number;
  /** Working vocabulary including preset and custom rows. */
  entries: MandarinBingoEntry[];
}

/**
 * One cell on the 5×5 bingo board.
 */
export type MandarinBingoCell =
  | { kind: 'free' }
  | { kind: 'empty' }
  | { kind: 'character'; entry: MandarinBingoEntry };

/**
 * Fixed-length board array (25 cells); index 12 is FREE when BOARD_SIZE === 5.
 */
export type MandarinBingoBoard = MandarinBingoCell[];

/**
 * Schema version understood by the current build.
 */
export const CURRENT_SCHEMA_VERSION = 1;
