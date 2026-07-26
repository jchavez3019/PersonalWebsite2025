/**
 * Board generation, placement, and move/swap unit tests (wave_1 specs 0006 / 0009).
 */
import { cloneMandarinBingoPreset } from './mandarin-bingo.preset';
import {
  clearEntryFromBoard,
  createEmptyBoard,
  fillRemainingBingoCells,
  FREE_CELL_INDEX,
  generateBingoBoard,
  moveOrSwapBoardCells,
  placeEntryOnBoard,
  replaceEntryOnBoard,
} from './mandarin-bingo-board';
import { MandarinBingoEntry } from './mandarin-bingo.types';

describe('mandarin-bingo-board', () => {
  const entries: MandarinBingoEntry[] = cloneMandarinBingoPreset();

  it('test_create_empty_board_has_free_center_and_24_empty_cells', () => {
    /**
     * Given a new empty board
     * When createEmptyBoard is called
     * Then index 12 is FREE and other cells are empty
     */
    const board = createEmptyBoard();
    expect(board.length).toBe(25);
    expect(board[FREE_CELL_INDEX].kind).toBe('free');
    expect(board.filter((cell) => cell.kind === 'empty').length).toBe(24);
  });

  it('test_generate_bingo_board_fills_24_unique_entries_with_free_center', () => {
    /**
     * Given the full preset
     * When generateBingoBoard runs
     * Then the board has FREE center and 24 unique character ids
     */
    const result = generateBingoBoard(entries, () => 0.5);
    expect(result.ok).toBeTrue();
    if (!result.ok) {
      return;
    }

    expect(result.board[FREE_CELL_INDEX].kind).toBe('free');
    const ids = result.board
      .filter((cell) => cell.kind === 'character')
      .map((cell) => (cell.kind === 'character' ? cell.entry.id : ''));
    expect(ids.length).toBe(24);
    expect(new Set(ids).size).toBe(24);
  });

  it('test_fill_remaining_skips_excluded_by_user_and_preserves_manual_placements', () => {
    /**
     * Given one placed cell, one excludedByUser entry, and enough eligible vocabulary
     * When fillRemainingBingoCells runs
     * Then the placed cell is unchanged and excluded id is unused
     */
    const working: MandarinBingoEntry[] = [
      ...entries.map((entry, index) =>
        index === 0 ? { ...entry, excludedByUser: true } : { ...entry },
      ),
      {
        id: 'custom-extra',
        character: '測',
        pinyin: 'cè',
        translation: 'test',
        source: 'custom',
        label: 'Extra',
        excludedByUser: false,
        createdAt: '2026-07-01T00:00:00.000Z',
        modifiedAt: '2026-07-01T00:00:00.000Z',
      },
    ];
    const placed = working[1];
    let board = createEmptyBoard();
    const placedResult = placeEntryOnBoard(board, 0, placed);
    expect(placedResult.ok).toBeTrue();
    if (!placedResult.ok) {
      return;
    }

    board = placedResult.board;
    const result = fillRemainingBingoCells(board, working, () => 0.25);
    expect(result.ok).toBeTrue();
    if (!result.ok) {
      return;
    }

    const cell0 = result.board[0];
    expect(cell0.kind).toBe('character');
    if (cell0.kind === 'character') {
      expect(cell0.entry.id).toBe(placed.id);
    }

    const usedIds = result.board
      .filter((cell) => cell.kind === 'character')
      .map((cell) => (cell.kind === 'character' ? cell.entry.id : ''));
    expect(usedIds).not.toContain(working[0].id);
  });

  it('test_fill_respects_custom_eligibility_predicate_for_inactive_labels', () => {
    /**
     * Given all entries fail a custom eligibility predicate
     * When fillRemainingBingoCells runs
     * Then insufficient_entries is returned
     */
    const board = createEmptyBoard();
    const result = fillRemainingBingoCells(
      board,
      entries,
      () => 0.5,
      () => false,
    );
    expect(result.ok).toBeFalse();
    if (!result.ok) {
      expect(result.reason).toBe('insufficient_entries');
      expect(result.actual).toBe(0);
    }
  });

  it('test_place_entry_rejects_excluded_duplicate_and_free_center', () => {
    /**
     * Given an empty board and entries
     * When place is attempted on FREE, duplicate, or excludedByUser
     * Then the result is not ok with the matching reason
     */
    const board = createEmptyBoard();
    const entry = entries[0];
    expect(placeEntryOnBoard(board, FREE_CELL_INDEX, entry).ok).toBeFalse();

    const first = placeEntryOnBoard(board, 0, entry);
    expect(first.ok).toBeTrue();
    if (!first.ok) {
      return;
    }

    const dup = placeEntryOnBoard(first.board, 1, entry);
    expect(dup.ok).toBeFalse();
    if (!dup.ok) {
      expect(dup.reason).toBe('duplicate_entry');
    }

    const excluded = { ...entries[1], excludedByUser: true };
    const excludedPlace = placeEntryOnBoard(first.board, 1, excluded);
    expect(excludedPlace.ok).toBeFalse();
    if (!excludedPlace.ok) {
      expect(excludedPlace.reason).toBe('entry_excluded');
    }
  });

  it('test_clear_entry_from_board_removes_matching_cells', () => {
    /**
     * Given a board with a placed entry
     * When clearEntryFromBoard is called for that id
     * Then the cell becomes empty
     */
    const entry = entries[0];
    const placed = placeEntryOnBoard(createEmptyBoard(), 0, entry);
    expect(placed.ok).toBeTrue();
    if (!placed.ok) {
      return;
    }

    const cleared = clearEntryFromBoard(placed.board, entry.id);
    expect(cleared[0].kind).toBe('empty');
  });

  it('test_generate_fails_when_eligible_pool_is_too_small', () => {
    /**
     * Given fewer than 24 non-excluded entries
     * When generateBingoBoard runs
     * Then insufficient_entries is returned
     */
    const shortList = entries.slice(0, 23);
    const result = generateBingoBoard(shortList);
    expect(result.ok).toBeFalse();
    if (!result.ok) {
      expect(result.reason).toBe('insufficient_entries');
      expect(result.required).toBe(24);
      expect(result.actual).toBe(23);
    }
  });

  it('test_move_board_cell_to_empty_target', () => {
    /**
     * Given a character at index 0
     * When moved to empty index 1
     * Then index 1 holds the entry and index 0 is empty
     */
    const entry = entries[0];
    const placed = placeEntryOnBoard(createEmptyBoard(), 0, entry);
    expect(placed.ok).toBeTrue();
    if (!placed.ok) {
      return;
    }

    const moved = moveOrSwapBoardCells(placed.board, 0, 1);
    expect(moved.ok).toBeTrue();
    if (!moved.ok) {
      return;
    }

    expect(moved.board[0].kind).toBe('empty');
    expect(moved.board[1].kind).toBe('character');
    if (moved.board[1].kind === 'character') {
      expect(moved.board[1].entry.id).toBe(entry.id);
    }
  });

  it('test_swap_board_cells_when_target_occupied', () => {
    /**
     * Given characters at indices 0 and 1
     * When moving 0 onto 1
     * Then the two entries swap places
     */
    const a = entries[0];
    const b = entries[1];
    let board = createEmptyBoard();
    const first = placeEntryOnBoard(board, 0, a);
    expect(first.ok).toBeTrue();
    if (!first.ok) {
      return;
    }

    board = first.board;
    const second = placeEntryOnBoard(board, 1, b);
    expect(second.ok).toBeTrue();
    if (!second.ok) {
      return;
    }

    const swapped = moveOrSwapBoardCells(second.board, 0, 1);
    expect(swapped.ok).toBeTrue();
    if (!swapped.ok) {
      return;
    }

    expect(swapped.board[0].kind).toBe('character');
    expect(swapped.board[1].kind).toBe('character');
    if (
      swapped.board[0].kind === 'character' &&
      swapped.board[1].kind === 'character'
    ) {
      expect(swapped.board[0].entry.id).toBe(b.id);
      expect(swapped.board[1].entry.id).toBe(a.id);
    }
  });

  it('test_replace_entry_on_board_evicts_occupant', () => {
    /**
     * Given a filled cell and a different eligible vocab entry
     * When replaceEntryOnBoard runs
     * Then the new entry occupies the cell and the old id is gone
     */
    const a = entries[0];
    const b = entries[1];
    const placed = placeEntryOnBoard(createEmptyBoard(), 0, a);
    expect(placed.ok).toBeTrue();
    if (!placed.ok) {
      return;
    }

    const replaced = replaceEntryOnBoard(placed.board, 0, b);
    expect(replaced.ok).toBeTrue();
    if (!replaced.ok) {
      return;
    }

    expect(replaced.board[0].kind).toBe('character');
    if (replaced.board[0].kind === 'character') {
      expect(replaced.board[0].entry.id).toBe(b.id);
    }
  });
});
