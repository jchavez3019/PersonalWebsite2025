/**
 * Shared constants for Mandarin bingo board geometry and persistence.
 */

/** localStorage key for the versioned vocabulary envelope. */
export const MANDARIN_BINGO_STORAGE_KEY = 'mandarin-bingo:character-list';

/** Edge length of the square bingo board. */
export const BOARD_SIZE = 5;

/** Number of playable (non-FREE) cells on a 5×5 board. */
export const PLAYABLE_CELL_COUNT = 24;

/** Row-major index of the FREE center cell (0-based). */
export const FREE_CELL_INDEX = 12;

/** Label rendered in the FREE center cell. */
export const FREE_CELL_LABEL = 'FREE';

/** Reserved label applied to every shipped preset row. */
export const PRESET_LABEL = 'Lesson 5';

/** Maximum length for custom vocabulary labels. */
export const MAX_CUSTOM_LABEL_LENGTH = 15;

/**
 * Fixed shipped timestamps for preset rows so sort-by-created/modified is stable.
 * Intentionally older than typical custom timestamps so presets sort last on modified-desc.
 */
export const PRESET_CREATED_AT = '2026-01-01T00:00:00.000Z';

/** Fixed modified timestamp for preset rows. */
export const PRESET_MODIFIED_AT = '2026-01-01T00:00:00.000Z';
