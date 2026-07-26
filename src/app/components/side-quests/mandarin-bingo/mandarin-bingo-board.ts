/**
 * Pure board helpers: empty board, place/clear/move/swap, and Fisher–Yates fill.
 */

import {
  BOARD_SIZE,
  FREE_CELL_INDEX,
  PLAYABLE_CELL_COUNT,
} from './mandarin-bingo.constants';
import {
  MandarinBingoBoard,
  MandarinBingoCell,
  MandarinBingoEntry,
} from './mandarin-bingo.types';

/**
 * Predicate used by place/fill to decide whether an entry may enter the board.
 */
export type EntryEligibilityPredicate = (entry: MandarinBingoEntry) => boolean;

/**
 * Result of attempting to place, clear, move, or swap a board cell.
 */
export type PlaceEntryResult =
  | { ok: true; board: MandarinBingoBoard }
  | {
      ok: false;
      reason:
        | 'cell_not_empty'
        | 'cell_is_free'
        | 'duplicate_entry'
        | 'entry_excluded'
        | 'invalid_index'
        | 'source_not_character';
    };

/**
 * Result of randomly filling empty playable cells.
 */
export type FillBoardResult =
  | { ok: true; board: MandarinBingoBoard }
  | {
      ok: false;
      reason: 'insufficient_entries';
      required: number;
      actual: number;
    };

/**
 * Builds a 5×5 board with FREE at the center and empty playable cells.
 *
 * @returns A new board of length 25 with index 12 set to FREE.
 */
export function createEmptyBoard(): MandarinBingoBoard {
  const totalCells = BOARD_SIZE * BOARD_SIZE;
  const board: MandarinBingoBoard = [];

  for (let index = 0; index < totalCells; index++) {
    if (index === FREE_CELL_INDEX) {
      board.push({ kind: 'free' });
    } else {
      board.push({ kind: 'empty' });
    }
  }

  return board;
}

/**
 * Places an eligible entry onto an empty playable cell without mutating the input board.
 *
 * @param board - Current bingo board to copy from.
 * @param cellIndex - Zero-based index of the target playable cell.
 * @param entry - Vocabulary entry to place; must be eligible and not already on the board.
 * @param isEligible - Eligibility predicate; defaults to `!excludedByUser` only.
 * @returns Success with the updated board, or a failure reason when placement is invalid.
 */
export function placeEntryOnBoard(
  board: MandarinBingoBoard,
  cellIndex: number,
  entry: MandarinBingoEntry,
  isEligible: EntryEligibilityPredicate = (row) => !row.excludedByUser,
): PlaceEntryResult {
  if (cellIndex < 0 || cellIndex >= board.length) {
    return { ok: false, reason: 'invalid_index' };
  }

  if (cellIndex === FREE_CELL_INDEX || board[cellIndex].kind === 'free') {
    return { ok: false, reason: 'cell_is_free' };
  }

  if (board[cellIndex].kind !== 'empty') {
    return { ok: false, reason: 'cell_not_empty' };
  }

  if (!isEligible(entry)) {
    return { ok: false, reason: 'entry_excluded' };
  }

  if (boardHasEntryId(board, entry.id)) {
    return { ok: false, reason: 'duplicate_entry' };
  }

  const next = cloneBoard(board);
  next[cellIndex] = { kind: 'character', entry: { ...entry } };
  return { ok: true, board: next };
}

/**
 * Places an eligible entry onto a playable cell, replacing any existing occupant.
 *
 * Used when dragging/tapping a vocabulary word onto an already-filled cell.
 * Does not swap with the list; the previous board tile is simply evicted.
 *
 * @param board - Current bingo board to copy from.
 * @param cellIndex - Zero-based index of the target playable cell.
 * @param entry - Vocabulary entry to place; must be eligible and not already elsewhere on the board.
 * @param isEligible - Eligibility predicate; defaults to `!excludedByUser` only.
 * @returns Success with the updated board, or a failure reason when placement is invalid.
 */
export function replaceEntryOnBoard(
  board: MandarinBingoBoard,
  cellIndex: number,
  entry: MandarinBingoEntry,
  isEligible: EntryEligibilityPredicate = (row) => !row.excludedByUser,
): PlaceEntryResult {
  if (cellIndex < 0 || cellIndex >= board.length) {
    return { ok: false, reason: 'invalid_index' };
  }

  if (cellIndex === FREE_CELL_INDEX || board[cellIndex].kind === 'free') {
    return { ok: false, reason: 'cell_is_free' };
  }

  if (!isEligible(entry)) {
    return { ok: false, reason: 'entry_excluded' };
  }

  // Reject if this entry already occupies a different cell.
  for (let index = 0; index < board.length; index++) {
    const cell = board[index];
    if (
      cell.kind === 'character' &&
      cell.entry.id === entry.id &&
      index !== cellIndex
    ) {
      return { ok: false, reason: 'duplicate_entry' };
    }
  }

  const next = cloneBoard(board);
  next[cellIndex] = { kind: 'character', entry: { ...entry } };
  return { ok: true, board: next };
}

/**
 * Clears a single playable character cell back to empty without mutating the input board.
 *
 * @param board - Current bingo board to copy from.
 * @param cellIndex - Zero-based index of the character cell to clear.
 * @returns Success with the updated board, or a failure reason when the cell cannot be cleared.
 */
export function clearBoardCell(
  board: MandarinBingoBoard,
  cellIndex: number,
): PlaceEntryResult {
  if (cellIndex < 0 || cellIndex >= board.length) {
    return { ok: false, reason: 'invalid_index' };
  }

  if (cellIndex === FREE_CELL_INDEX || board[cellIndex].kind === 'free') {
    return { ok: false, reason: 'cell_is_free' };
  }

  if (board[cellIndex].kind !== 'character') {
    return { ok: false, reason: 'cell_not_empty' };
  }

  const next = cloneBoard(board);
  next[cellIndex] = { kind: 'empty' };
  return { ok: true, board: next };
}

/**
 * Moves a character cell to an empty target, or swaps with an occupied target.
 *
 * @param board - Current bingo board to copy from.
 * @param fromIndex - Source character cell index.
 * @param toIndex - Destination playable cell index (empty or character).
 * @returns Success with the updated board, or a failure reason when the move is invalid.
 */
export function moveOrSwapBoardCells(
  board: MandarinBingoBoard,
  fromIndex: number,
  toIndex: number,
): PlaceEntryResult {
  if (
    fromIndex < 0 ||
    fromIndex >= board.length ||
    toIndex < 0 ||
    toIndex >= board.length
  ) {
    return { ok: false, reason: 'invalid_index' };
  }

  if (
    fromIndex === FREE_CELL_INDEX ||
    toIndex === FREE_CELL_INDEX ||
    board[fromIndex].kind === 'free' ||
    board[toIndex].kind === 'free'
  ) {
    return { ok: false, reason: 'cell_is_free' };
  }

  if (board[fromIndex].kind !== 'character') {
    return { ok: false, reason: 'source_not_character' };
  }

  if (fromIndex === toIndex) {
    return { ok: true, board: cloneBoard(board) };
  }

  const next = cloneBoard(board);
  const source = next[fromIndex];
  const target = next[toIndex];

  if (target.kind === 'empty') {
    next[toIndex] = source;
    next[fromIndex] = { kind: 'empty' };
    return { ok: true, board: next };
  }

  if (target.kind === 'character') {
    next[toIndex] = source;
    next[fromIndex] = target;
    return { ok: true, board: next };
  }

  return { ok: false, reason: 'invalid_index' };
}

/**
 * Clears every character cell that holds the given entry id (exclude-while-placed).
 *
 * @param board - Current bingo board to copy from.
 * @param entryId - Vocabulary entry id to remove from the board.
 * @returns A new board with matching character cells set to empty.
 */
export function clearEntryFromBoard(
  board: MandarinBingoBoard,
  entryId: string,
): MandarinBingoBoard {
  return board.map((cell) => {
    if (cell.kind === 'character' && cell.entry.id === entryId) {
      return { kind: 'empty' } satisfies MandarinBingoCell;
    }

    return cloneCell(cell);
  });
}

/**
 * Clears every character cell whose entry fails the eligibility predicate.
 *
 * @param board - Current bingo board to copy from.
 * @param isEligible - Eligibility predicate for entries still allowed on the board.
 * @returns A new board with ineligible character cells set to empty.
 */
export function clearIneligibleFromBoard(
  board: MandarinBingoBoard,
  isEligible: EntryEligibilityPredicate,
): MandarinBingoBoard {
  return board.map((cell) => {
    if (cell.kind === 'character' && !isEligible(cell.entry)) {
      return { kind: 'empty' } satisfies MandarinBingoCell;
    }

    return cloneCell(cell);
  });
}

/**
 * Collects board indices of character cells that fail the eligibility predicate.
 *
 * @param board - Board to inspect.
 * @param isEligible - Eligibility predicate.
 * @returns Indices that should fade off before / while clearing.
 */
export function findIneligibleBoardIndices(
  board: MandarinBingoBoard,
  isEligible: EntryEligibilityPredicate,
): number[] {
  const indices: number[] = [];

  for (let index = 0; index < board.length; index++) {
    const cell = board[index];
    if (cell.kind === 'character' && !isEligible(cell.entry)) {
      indices.push(index);
    }
  }

  return indices;
}

/**
 * Fills empty playable cells via Fisher–Yates using eligible entries not already on the board.
 *
 * @param board - Current board whose empty cells should be filled; existing placements are kept.
 * @param entries - Full working vocabulary list (ineligible rows are omitted from the pool).
 * @param rng - Optional unit-interval random source for deterministic tests; defaults to Math.random.
 * @param isEligible - Eligibility predicate; defaults to `!excludedByUser` only.
 * @returns Success with the updated board, or insufficient_entries when the eligible pool is too small.
 */
export function fillRemainingBingoCells(
  board: MandarinBingoBoard,
  entries: MandarinBingoEntry[],
  rng: () => number = Math.random,
  isEligible: EntryEligibilityPredicate = (row) => !row.excludedByUser,
): FillBoardResult {
  const emptyIndices: number[] = [];
  const usedIds = new Set<string>();

  // Collect empty slots and ids already on the board.
  for (let index = 0; index < board.length; index++) {
    const cell = board[index];

    if (cell.kind === 'empty' && index !== FREE_CELL_INDEX) {
      emptyIndices.push(index);
    }

    if (cell.kind === 'character') {
      usedIds.add(cell.entry.id);
    }
  }

  const pool = entries.filter(
    (entry) => isEligible(entry) && !usedIds.has(entry.id),
  );

  if (pool.length < emptyIndices.length) {
    return {
      ok: false,
      reason: 'insufficient_entries',
      required: emptyIndices.length,
      actual: pool.length,
    };
  }

  // Shuffle the pool of entries and place them into a new copy of the board.
  const shuffled = fisherYatesShuffle(pool.map((entry) => ({ ...entry })), rng);
  const next = cloneBoard(board);

  for (let i = 0; i < emptyIndices.length; i++) {
    next[emptyIndices[i]] = {
      kind: 'character',
      entry: shuffled[i],
    };
  }

  return { ok: true, board: next };
}

/**
 * Fully regenerates a board by emptying it and filling all 24 playable cells.
 *
 * @param entries - Working vocabulary list used as the fill pool.
 * @param rng - Optional unit-interval random source for deterministic tests; defaults to Math.random.
 * @param isEligible - Eligibility predicate; defaults to `!excludedByUser` only.
 * @returns Success with a new full board, or insufficient_entries when fewer than 24 eligible rows exist.
 */
export function generateBingoBoard(
  entries: MandarinBingoEntry[],
  rng: () => number = Math.random,
  isEligible: EntryEligibilityPredicate = (row) => !row.excludedByUser,
): FillBoardResult {
  return fillRemainingBingoCells(createEmptyBoard(), entries, rng, isEligible);
}

/**
 * Produces a uniform random permutation via the modern Fisher–Yates algorithm.
 *
 * @typeParam T - Element type stored in the array.
 * @param items - Source array; it is not mutated (a shallow copy is shuffled).
 * @param rng - Optional unit-interval random source; defaults to Math.random.
 * @returns A new array containing the same elements in shuffled order.
 */
export function fisherYatesShuffle<T>(
  items: T[],
  rng: () => number = Math.random,
): T[] {
  const array = items.slice();

  for (let i = array.length - 1; i >= 1; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }

  return array;
}

/**
 * Reports whether any character cell already holds the given entry id.
 *
 * @param board - Board to inspect.
 * @param entryId - Vocabulary entry id to search for.
 * @returns True when the id is already present on the board.
 */
function boardHasEntryId(board: MandarinBingoBoard, entryId: string): boolean {
  return board.some(
    (cell) => cell.kind === 'character' && cell.entry.id === entryId,
  );
}

/**
 * Deep-clones a board so callers can update cells without mutating the original.
 *
 * @param board - Board to clone.
 * @returns A new board with cloned cells and entry objects.
 */
function cloneBoard(board: MandarinBingoBoard): MandarinBingoBoard {
  return board.map((cell) => cloneCell(cell));
}

/**
 * Clones a single board cell, copying the nested entry when present.
 *
 * @param cell - Cell to clone.
 * @returns A new cell of the same kind.
 */
function cloneCell(cell: MandarinBingoCell): MandarinBingoCell {
  if (cell.kind === 'character') {
    return { kind: 'character', entry: { ...cell.entry } };
  }

  return { kind: cell.kind };
}

/** Exported for tests that assert playable geometry. */
export { PLAYABLE_CELL_COUNT, FREE_CELL_INDEX };
