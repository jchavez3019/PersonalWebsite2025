/**
 * Mandarin bingo mini-app: vocabulary editor, Active labels, board place/move/fill, print.
 */

import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

import {
  clearBoardCell,
  clearEntryFromBoard,
  clearIneligibleFromBoard,
  createEmptyBoard,
  fillRemainingBingoCells,
  findIneligibleBoardIndices,
  moveOrSwapBoardCells,
  placeEntryOnBoard,
  replaceEntryOnBoard,
} from './mandarin-bingo-board';
import {
  MandarinBingoActiveLabelsDialogComponent,
  MandarinBingoActiveLabelsDialogData,
} from './mandarin-bingo-active-labels-dialog/mandarin-bingo-active-labels-dialog.component';
import {
  MandarinBingoEntryDialogComponent,
  MandarinBingoEntryDialogData,
  MandarinBingoEntryDialogResult,
} from './mandarin-bingo-entry-dialog/mandarin-bingo-entry-dialog.component';
import {
  collectCustomLabels,
  collectLabels,
  collectReservedLabels,
  countEligible,
  createDefaultActiveLabels,
  isEligible,
  labelIsActive,
} from './mandarin-bingo-eligibility';
import {
  loadCharacterList,
  resetCharacterList,
  saveCharacterList,
} from './mandarin-bingo-storage';
import {
  sortVocabularyEntries,
  VocabSortDirection,
  VocabSortKey,
} from './mandarin-bingo-sort';
import { FREE_CELL_LABEL } from './mandarin-bingo.constants';
import {
  CURRENT_SCHEMA_VERSION,
  MandarinBingoBoard,
  MandarinBingoEntry,
} from './mandarin-bingo.types';

/** Drag payload prefix distinguishing board-cell moves from vocab placements. */
const BOARD_DRAG_PREFIX = 'board:';

/** Vocab drag payload prefix. */
const VOCAB_DRAG_PREFIX = 'vocab:';

/** Square logical size for the canvas drag image (CSS pixels). */
const DRAG_TILE_SIZE_PX = 72;

/** Duration of board FLIP transitions in milliseconds. */
const BOARD_FLIP_MS = 220;

/**
 * Routed Side Quest UI for building and printing a traditional Mandarin bingo board.
 */
@Component({
  selector: 'app-mandarin-bingo',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './mandarin-bingo.component.html',
  styleUrl: './mandarin-bingo.component.css',
})
export class MandarinBingoComponent implements OnInit, OnDestroy {
  /** Working vocabulary list (preset + custom), including ineligible rows. */
  entries: MandarinBingoEntry[] = [];

  /** Session-only board; reset to empty on each page load. */
  board: MandarinBingoBoard = createEmptyBoard();

  /** Session-only toggle controlling pinyin visibility on board tiles. */
  showPinyinOnBoard = true;

  /** Session-only Active labels include-set. */
  activeLabels = new Set<string>();

  /** Session sort key for the vocabulary list. */
  sortKey: VocabSortKey = 'pinyin';

  /** Session sort direction for the vocabulary list. */
  sortDirection: VocabSortDirection = 'asc';

  /** Selected vocabulary id for tap-to-place; null when nothing is selected. */
  selectedEntryId: string | null = null;

  /** Selected board cell index for move/remove; null when nothing is selected. */
  selectedBoardIndex: number | null = null;

  /** Cell indices currently animating a fade-out before clear. */
  fadingCellIndices = new Set<number>();

  /** Source board index while a board-tile HTML5 drag is in progress. */
  private boardDragFromIndex: number | null = null;

  /** True when the active board drag was consumed by a cell drop or off-board remove. */
  private boardDragHandled = false;

  /** Canvas appended for Chrome setDragImage; removed on dragend. */
  private dragImageCanvas: HTMLCanvasElement | null = null;

  /** Pending fade-out timer handle. */
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;

  /** Pending FLIP cleanup timer handle. */
  private flipTimer: ReturnType<typeof setTimeout> | null = null;

  /** Label shown in the FREE center cell. */
  readonly freeLabel = FREE_CELL_LABEL;

  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly hostRef = inject(ElementRef<HTMLElement>);

  /**
   * Loads persisted vocabulary and initializes session board + Active labels.
   */
  ngOnInit(): void {
    const envelope = loadCharacterList();
    this.entries = envelope.entries;
    this.activeLabels = createDefaultActiveLabels(this.entries);
    this.board = createEmptyBoard();
  }

  /**
   * Clears timers and any leftover drag-image canvas on destroy.
   */
  ngOnDestroy(): void {
    this.clearFadeTimer();
    this.clearFlipTimer();
    this.removeDragImageCanvas();
  }

  /**
   * Sorted view of the vocabulary list for template rendering.
   *
   * @returns Entries ordered by the current sort preference.
   */
  get sortedEntries(): MandarinBingoEntry[] {
    return sortVocabularyEntries(this.entries, this.sortKey, this.sortDirection);
  }

  /**
   * Eligible count for the `x` in `x/n`.
   *
   * @returns Number of eligible vocabulary rows.
   */
  get eligibleCount(): number {
    return countEligible(this.entries, this.activeLabels);
  }

  /**
   * Total vocabulary count for the `n` in `x/n`.
   *
   * @returns Length of the working list.
   */
  get totalCount(): number {
    return this.entries.length;
  }

  /**
   * Persists the current working list under the versioned localStorage envelope.
   */
  private persistEntries(): void {
    saveCharacterList({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      entries: this.entries,
    });
  }

  /**
   * Eligibility predicate bound to the current session Active labels.
   *
   * @param entry - Vocabulary row to evaluate.
   * @returns True when the entry may be placed or filled.
   */
  entryIsEligible(entry: MandarinBingoEntry): boolean {
    return isEligible(entry, this.activeLabels);
  }

  /**
   * Whether the entry's label is currently in the Active labels set.
   *
   * @param entry - Vocabulary row to evaluate.
   * @returns True when the label gate is open for this row.
   */
  entryLabelIsActive(entry: MandarinBingoEntry): boolean {
    return labelIsActive(entry.label, this.activeLabels);
  }

  /**
   * Whether Exclude should appear checked (user bench OR inactive label).
   *
   * @param entry - Vocabulary row to evaluate.
   * @returns True when the checkbox should look checked.
   */
  excludeCheckboxChecked(entry: MandarinBingoEntry): boolean {
    return entry.excludedByUser || !this.entryLabelIsActive(entry);
  }

  /**
   * Whether Exclude interaction is disabled because the label is inactive.
   *
   * @param entry - Vocabulary row to evaluate.
   * @returns True when Option A applies (label inactive).
   */
  excludeCheckboxDisabled(entry: MandarinBingoEntry): boolean {
    return !this.entryLabelIsActive(entry);
  }

  /**
   * Whether the entry id is currently on the board.
   *
   * @param entryId - Vocabulary entry id.
   * @returns True when a character cell holds this id.
   */
  isPlacedOnBoard(entryId: string): boolean {
    return this.board.some(
      (cell) => cell.kind === 'character' && cell.entry.id === entryId,
    );
  }

  /**
   * Display string for a label (Unlabeled for empty).
   *
   * @param label - Raw label.
   * @returns User-facing label text.
   */
  displayLabel(label: string): string {
    return label === '' ? 'Unlabeled' : label;
  }

  /**
   * Track-by helper for the vocabulary list so Angular can reuse row DOM nodes.
   *
   * @param _index - Row index in the ngFor (unused).
   * @param entry - Vocabulary entry for the current row.
   * @returns Stable identity string for the row.
   */
  trackEntryById(_index: number, entry: MandarinBingoEntry): string {
    return entry.id;
  }

  /**
   * Applies a sort preference from the header menu.
   *
   * @param key - Sort field.
   * @param direction - Ascending or descending.
   */
  setSort(key: VocabSortKey, direction: VocabSortDirection): void {
    this.sortKey = key;
    this.sortDirection = direction;
  }

  /**
   * Reports whether a sort menu entry matches the current session preference.
   *
   * @param key - Sort field for the menu item.
   * @param direction - Sort direction for the menu item.
   * @returns True when this item is the active sort.
   */
  isSortSelected(key: VocabSortKey, direction: VocabSortDirection): boolean {
    return this.sortKey === key && this.sortDirection === direction;
  }

  /**
   * Opens the Active labels dialog and applies the session include-set on confirm.
   */
  openActiveLabelsDialog(): void {
    const data: MandarinBingoActiveLabelsDialogData = {
      availableLabels: collectLabels(this.entries),
      activeLabels: [...this.activeLabels],
    };

    const ref = this.dialog.open(MandarinBingoActiveLabelsDialogComponent, {
      data,
      width: '420px',
      panelClass: 'bingo-active-labels-dialog-panel',
    });

    ref.afterClosed().subscribe((result: string[] | undefined) => {
      if (!result) {
        return;
      }

      this.activeLabels = new Set(result);
      this.fadeClearIneligible();
    });
  }

  /**
   * Opens the add-custom dialog and appends a saved entry.
   */
  openAddDialog(): void {
    this.openEntryDialog('add', null);
  }

  /**
   * Opens the edit dialog for a custom entry.
   *
   * @param entry - Custom vocabulary row to edit.
   * @param event - Click event to stop row selection.
   */
  openEditDialog(entry: MandarinBingoEntry, event: Event): void {
    event.stopPropagation();
    if (entry.source !== 'custom') {
      return;
    }

    this.openEntryDialog('edit', entry);
  }

  /**
   * Shared add/edit dialog flow with snackbar on successful save.
   *
   * @param mode - Add or edit mode.
   * @param entry - Existing entry when editing; null when adding.
   */
  private openEntryDialog(
    mode: 'add' | 'edit',
    entry: MandarinBingoEntry | null,
  ): void {
    const data: MandarinBingoEntryDialogData = {
      mode,
      character: entry?.character ?? '',
      pinyin: entry?.pinyin ?? '',
      translation: entry?.translation ?? '',
      label: entry?.label ?? '',
      customLabels: collectCustomLabels(this.entries),
      reservedLabels: [...collectReservedLabels(this.entries)],
      entryId: entry?.id ?? null,
    };

    const ref = this.dialog.open(MandarinBingoEntryDialogComponent, {
      data,
      width: '420px',
    });

    ref.afterClosed().subscribe((result: MandarinBingoEntryDialogResult | undefined) => {
      if (!result) {
        return;
      }

      if (mode === 'add') {
        this.applyAddResult(result);
      } else {
        this.applyEditResult(result);
      }
    });
  }

  /**
   * Appends a custom entry from a dialog result after uniqueness checks.
   *
   * @param result - Validated dialog form values.
   */
  private applyAddResult(result: MandarinBingoEntryDialogResult): void {
    if (this.entries.some((row) => row.character === result.character)) {
      this.showErrorToast('That character is already in the vocabulary list.');
      return;
    }

    const now = new Date().toISOString();
    const next: MandarinBingoEntry = {
      id: crypto.randomUUID(),
      character: result.character,
      pinyin: result.pinyin,
      translation: result.translation,
      source: 'custom',
      label: result.label,
      excludedByUser: false,
      createdAt: now,
      modifiedAt: now,
    };

    this.entries = [...this.entries, next];

    // New labels join the Active set so freshly added words are immediately eligible.
    this.activeLabels = new Set([...this.activeLabels, next.label]);
    this.persistEntries();
    this.showSavedSnack();
  }

  /**
   * Updates a custom entry from a dialog result and fades the board if it becomes ineligible.
   *
   * @param result - Validated dialog form values including entryId.
   */
  private applyEditResult(result: MandarinBingoEntryDialogResult): void {
    if (!result.entryId) {
      return;
    }

    const duplicate = this.entries.some(
      (row) =>
        row.character === result.character && row.id !== result.entryId,
    );
    if (duplicate) {
      this.showErrorToast('That character is already in the vocabulary list.');
      return;
    }

    const priorLabels = new Set(collectLabels(this.entries));
    const now = new Date().toISOString();
    this.entries = this.entries.map((row) =>
      row.id === result.entryId
        ? {
            ...row,
            character: result.character,
            pinyin: result.pinyin,
            translation: result.translation,
            label: result.label,
            modifiedAt: now,
          }
        : row,
    );

    // Prune labels that disappeared; activate brand-new labels from this edit.
    this.pruneActiveLabelsToPresent();
    if (!priorLabels.has(result.label)) {
      this.activeLabels = new Set([...this.activeLabels, result.label]);
    }

    this.persistEntries();
    this.fadeClearIneligible();
    this.showSavedSnack();
  }

  /**
   * Shows a short “Saved” snackbar with a green check affordance.
   */
  private showSavedSnack(): void {
    this.snackBar.open('✓ Saved', undefined, {
      duration: 2000,
      panelClass: ['bingo-saved-snack'],
    });
  }

  /**
   * Shows a bottom red error toast so mobile users need not scroll to the page top.
   *
   * @param message - User-facing error copy.
   */
  private showErrorToast(message: string): void {
    this.snackBar.open(message, undefined, {
      duration: 4000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['bingo-error-snack'],
    });
  }

  /**
   * Selects a eligible vocabulary entry for subsequent tap-to-place on the board.
   *
   * @param entry - Vocabulary row the user activated.
   */
  selectEntry(entry: MandarinBingoEntry): void {
    if (!this.entryIsEligible(entry)) {
      this.showErrorToast('Ineligible entries cannot be placed on the board.');
      return;
    }

    this.selectedEntryId = entry.id;
    this.selectedBoardIndex = null;
  }

  /**
   * Handles board cell click for place, move/swap, or clear selection.
   *
   * @param cellIndex - Zero-based board cell index that was activated.
   */
  onCellClick(cellIndex: number): void {
    const cell = this.board[cellIndex];

    // Moving a previously selected board tile onto another cell.
    if (this.selectedBoardIndex !== null) {
      if (this.selectedBoardIndex === cellIndex) {
        this.selectedBoardIndex = null;
        return;
      }

      if (cell.kind === 'free') {
        this.showErrorToast('The center FREE cell cannot hold a character.');
        return;
      }

      this.applyBoardMoveOrSwap(this.selectedBoardIndex, cellIndex, 'click');
      return;
    }

    // Placing a selected vocabulary entry onto an empty or occupied cell.
    if (this.selectedEntryId !== null) {
      const entry = this.entries.find((row) => row.id === this.selectedEntryId);
      if (!entry) {
        return;
      }

      this.placeOrReplaceVocab(entry, cellIndex);
      return;
    }

    // Selecting a filled cell to prepare a move, or ignoring empty without selection.
    if (cell.kind === 'character') {
      this.selectedBoardIndex = cellIndex;
      this.selectedEntryId = null;
    }
  }

  /**
   * Removes the selected board tile when the user clicks outside the board and vocab panel.
   *
   * @param event - Document click event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.selectedBoardIndex === null) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    if (target.closest('.bingo-board') || target.closest('.vocab-panel')) {
      return;
    }

    this.removeSelectedBoardTile();
  }

  /**
   * Starts a drag of a vocabulary row when the entry is eligible for placement.
   *
   * @param event - Browser dragstart event.
   * @param entry - Vocabulary row being dragged.
   */
  onVocabDragStart(event: DragEvent, entry: MandarinBingoEntry): void {
    if (!this.entryIsEligible(entry)) {
      event.preventDefault();
      return;
    }

    event.dataTransfer?.setData('text/plain', `${VOCAB_DRAG_PREFIX}${entry.id}`);
    event.dataTransfer!.effectAllowed = 'copyMove';
    this.setCanvasDragImage(event, entry.character, entry.pinyin);
  }

  /**
   * Starts a drag of a filled board cell for move/swap/remove.
   *
   * @param event - Browser dragstart event.
   * @param cellIndex - Index of the character cell being dragged.
   */
  onBoardDragStart(event: DragEvent, cellIndex: number): void {
    const cell = this.board[cellIndex];
    if (cell.kind !== 'character') {
      event.preventDefault();
      return;
    }

    event.dataTransfer?.setData(
      'text/plain',
      `${BOARD_DRAG_PREFIX}${cellIndex}`,
    );
    event.dataTransfer!.effectAllowed = 'move';
    this.selectedBoardIndex = cellIndex;
    this.boardDragFromIndex = cellIndex;
    this.boardDragHandled = false;
    this.setCanvasDragImage(event, cell.entry.character, cell.entry.pinyin);
  }

  /**
   * Allows document-wide drops while a board tile is dragging so release
   * outside `.bingo-page` still fires `drop` / can be handled on dragend.
   *
   * @param event - Browser dragover event anywhere in the document.
   */
  @HostListener('document:dragover', ['$event'])
  onDocumentDragOver(event: DragEvent): void {
    if (this.boardDragFromIndex === null) {
      return;
    }

    event.preventDefault();
  }

  /**
   * Removes a board tile dropped anywhere outside the bingo board.
   *
   * @param event - Browser drop event anywhere in the document.
   */
  @HostListener('document:drop', ['$event'])
  onDocumentDrop(event: DragEvent): void {
    if (this.boardDragFromIndex === null) {
      return;
    }

    event.preventDefault();
    const target = event.target as HTMLElement | null;
    if (target?.closest('.bingo-board')) {
      return;
    }

    this.removeBoardDragSource();
  }

  /**
   * Finishes a drag: removes unhandled board drags, then clears drag state.
   */
  onDragEnd(): void {
    if (this.boardDragFromIndex !== null && !this.boardDragHandled) {
      this.removeBoardDragSource();
    }

    this.boardDragFromIndex = null;
    this.boardDragHandled = false;
    this.removeDragImageCanvas();
  }

  /**
   * Allows drops onto board cells by preventing the browser default reject behavior.
   *
   * @param event - Browser dragover event on a board cell.
   */
  onCellDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handles drop of a vocab entry or board tile onto a target cell.
   *
   * @param event - Browser drop event carrying the drag payload.
   * @param cellIndex - Zero-based board cell index that received the drop.
   */
  onCellDrop(event: DragEvent, cellIndex: number): void {
    event.preventDefault();
    event.stopPropagation();
    const payload = event.dataTransfer?.getData('text/plain') ?? '';

    if (payload.startsWith(BOARD_DRAG_PREFIX)) {
      const fromIndex = Number(payload.slice(BOARD_DRAG_PREFIX.length));
      if (Number.isNaN(fromIndex)) {
        return;
      }

      this.boardDragHandled = true;
      this.applyBoardMoveOrSwap(fromIndex, cellIndex, 'drag');
      return;
    }

    if (payload.startsWith(VOCAB_DRAG_PREFIX)) {
      const entryId = payload.slice(VOCAB_DRAG_PREFIX.length);
      const entry = this.entries.find((row) => row.id === entryId);
      if (!entry) {
        return;
      }

      this.placeOrReplaceVocab(entry, cellIndex);
    }
  }

  /**
   * Fades out and clears the cell that started the active board drag.
   */
  private removeBoardDragSource(): void {
    const fromIndex = this.boardDragFromIndex;
    if (fromIndex === null) {
      return;
    }

    this.boardDragHandled = true;
    this.selectedBoardIndex = null;
    this.fadeClearCells([fromIndex]);
  }

  /**
   * Surfaces Option A guidance when the user clicks Exclude while the label is inactive.
   *
   * @param entry - Vocabulary row whose Exclude control was clicked.
   */
  onExcludeSlotClick(entry: MandarinBingoEntry): void {
    if (!this.entryLabelIsActive(entry)) {
      this.showErrorToast('Re-enable this label under Active labels before unchecking Exclude.');
    }
  }

  /**
   * Updates excludedByUser, or blocks uncheck when the label is inactive (Option A).
   *
   * @param entry - Vocabulary row whose exclusion state changed.
   * @param excluded - New exclusion value from the checkbox.
   */
  setExcluded(entry: MandarinBingoEntry, excluded: boolean): void {
    if (!this.entryLabelIsActive(entry)) {
      this.showErrorToast('Re-enable this label under Active labels before unchecking Exclude.');
      return;
    }

    this.entries = this.entries.map((row) =>
      row.id === entry.id ? { ...row, excludedByUser: excluded } : row,
    );
    this.persistEntries();

    if (excluded) {
      const indices = this.board
        .map((cell, index) =>
          cell.kind === 'character' && cell.entry.id === entry.id ? index : -1,
        )
        .filter((index) => index >= 0);
      this.fadeClearCells(indices);
      if (this.selectedEntryId === entry.id) {
        this.selectedEntryId = null;
      }
    }
  }

  /**
   * Deletes a custom vocabulary entry and removes it from the board if present.
   *
   * @param entry - Vocabulary row to delete; preset rows are ignored.
   * @param event - Click event to stop row selection.
   */
  deleteCustom(entry: MandarinBingoEntry, event: Event): void {
    event.stopPropagation();
    if (entry.source !== 'custom') {
      return;
    }

    this.entries = this.entries.filter((row) => row.id !== entry.id);
    this.board = clearEntryFromBoard(this.board, entry.id);
    this.pruneActiveLabelsToPresent();
    this.persistEntries();
  }

  /**
   * Confirms with the user, then factory-restores the preset vocabulary and clears the board.
   */
  requestResetToPreset(): void {
    const confirmed = window.confirm(
      'Reset to the shipped preset? This permanently deletes all custom entries and clears exclusions and the board.',
    );

    if (!confirmed) {
      return;
    }

    const envelope = resetCharacterList();
    this.entries = envelope.entries;
    this.activeLabels = createDefaultActiveLabels(this.entries);
    this.board = createEmptyBoard();
    this.selectedEntryId = null;
    this.selectedBoardIndex = null;
  }

  /**
   * Randomly fills remaining empty playable cells from the eligible vocabulary pool.
   */
  fillEmptyCells(): void {
    const result = fillRemainingBingoCells(
      this.board,
      this.entries,
      Math.random,
      (row) => this.entryIsEligible(row),
    );
    if (!result.ok) {
      this.showErrorToast(`Not enough eligible vocabulary: need ${result.required} unused entries, have ${result.actual}.`);
      return;
    }

    this.board = result.board;
  }

  /**
   * Resets the session board to empty playable cells with a FREE center.
   */
  clearBoard(): void {
    this.board = createEmptyBoard();
    this.selectedBoardIndex = null;
  }

  /**
   * Opens the browser print dialog for the current board preview.
   */
  printBoard(): void {
    window.print();
  }

  /**
   * Indicates whether the board has at least one character cell (used to enable Print).
   *
   * @returns True when any playable cell holds a character entry.
   */
  hasCharacterCells(): boolean {
    return this.board.some((cell) => cell.kind === 'character');
  }

  /**
   * Whether a board cell index is currently fading out.
   *
   * @param index - Board cell index.
   * @returns True when the fade class should apply.
   */
  isFading(index: number): boolean {
    return this.fadingCellIndices.has(index);
  }

  /**
   * Removes the selected board tile with a fade transition.
   */
  private removeSelectedBoardTile(): void {
    if (this.selectedBoardIndex === null) {
      return;
    }

    this.fadeClearCells([this.selectedBoardIndex]);
    this.selectedBoardIndex = null;
  }

  /**
   * Fades then clears every board cell that is no longer eligible.
   */
  private fadeClearIneligible(): void {
    const indices = findIneligibleBoardIndices(this.board, (entry) =>
      this.entryIsEligible(entry),
    );
    this.fadeClearCells(indices);
  }

  /**
   * Applies fade styling then clears the given cell indices.
   *
   * @param indices - Board indices to clear after a short fade.
   */
  private fadeClearCells(indices: number[]): void {
    if (indices.length === 0) {
      return;
    }

    this.clearFadeTimer();
    this.fadingCellIndices = new Set(indices);

    this.fadeTimer = setTimeout(() => {
      // Prefer clearIneligible when fading due to eligibility; for explicit ids use clearBoardCell.
      let next = this.board;
      for (const index of indices) {
        const cleared = clearBoardCell(next, index);
        if (cleared.ok) {
          next = cleared.board;
        }
      }

      this.board = clearIneligibleFromBoard(next, (entry) =>
        this.entryIsEligible(entry),
      );
      this.fadingCellIndices = new Set();
      this.fadeTimer = null;
    }, 220);
  }

  /**
   * Drops Active labels that no longer exist among entries; keeps intentional deactivations.
   */
  private pruneActiveLabelsToPresent(): void {
    const present = new Set(collectLabels(this.entries));
    this.activeLabels = new Set(
      [...this.activeLabels].filter((label) => present.has(label)),
    );
  }

  /**
   * Places a vocabulary entry on empty cells, or replaces an occupant on filled cells.
   *
   * @param entry - Eligible vocabulary row to place.
   * @param cellIndex - Target board index.
   */
  private placeOrReplaceVocab(
    entry: MandarinBingoEntry,
    cellIndex: number,
  ): void {
    const cell = this.board[cellIndex];
    const result =
      cell.kind === 'character'
        ? replaceEntryOnBoard(this.board, cellIndex, entry, (row) =>
            this.entryIsEligible(row),
          )
        : placeEntryOnBoard(this.board, cellIndex, entry, (row) =>
            this.entryIsEligible(row),
          );

    if (!result.ok) {
      this.showErrorToast(this.placeErrorMessage(result.reason));
      return;
    }

    this.board = result.board;
    this.selectedEntryId = null;
    this.selectedBoardIndex = null;
  }

  /**
   * Moves or swaps board tiles with click/drag-specific FLIP animation.
   *
   * @param fromIndex - Source character cell.
   * @param toIndex - Destination playable cell.
   * @param interaction - Click animates both tiles; drag snaps the dragged tile.
   */
  private applyBoardMoveOrSwap(
    fromIndex: number,
    toIndex: number,
    interaction: 'click' | 'drag',
  ): void {
    const targetBefore = this.board[toIndex];
    const isSwap = targetBefore.kind === 'character';
    const cells = this.queryBoardCells();
    const fromRect = cells[fromIndex]?.getBoundingClientRect();
    const toRect = cells[toIndex]?.getBoundingClientRect();

    const result = moveOrSwapBoardCells(this.board, fromIndex, toIndex);
    if (!result.ok) {
      this.showErrorToast(this.placeErrorMessage(result.reason));
      return;
    }

    this.board = result.board;
    this.selectedBoardIndex = null;
    this.selectedEntryId = null;

    if (!fromRect || !toRect) {
      return;
    }

    // Allow Angular to paint the new board before measuring “last” positions.
    requestAnimationFrame(() => {
      const afterCells = this.queryBoardCells();
      const flips: { el: HTMLElement; from: DOMRect; to: DOMRect }[] = [];

      if (interaction === 'click') {
        // Dragged/selected tile ends at toIndex; animate from old fromRect.
        const toEl = afterCells[toIndex];
        if (toEl) {
          flips.push({
            el: toEl,
            from: fromRect,
            to: toEl.getBoundingClientRect(),
          });
        }

        if (isSwap) {
          const fromEl = afterCells[fromIndex];
          if (fromEl) {
            flips.push({
              el: fromEl,
              from: toRect,
              to: fromEl.getBoundingClientRect(),
            });
          }
        }
      } else if (isSwap) {
        // Drag swap: dragged tile snaps; displaced tile linearly moves to fromIndex.
        const fromEl = afterCells[fromIndex];
        if (fromEl) {
          flips.push({
            el: fromEl,
            from: toRect,
            to: fromEl.getBoundingClientRect(),
          });
        }
      }

      this.playFlip(flips);
    });
  }

  /**
   * Plays a linear FLIP invert→none transition on the given elements.
   *
   * @param flips - Elements with pre-move and post-move bounding rects.
   */
  private playFlip(
    flips: { el: HTMLElement; from: DOMRect; to: DOMRect }[],
  ): void {
    if (flips.length === 0) {
      return;
    }

    this.clearFlipTimer();

    for (const flip of flips) {
      const dx = flip.from.left - flip.to.left;
      const dy = flip.from.top - flip.to.top;
      flip.el.style.transition = 'none';
      flip.el.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    requestAnimationFrame(() => {
      for (const flip of flips) {
        flip.el.style.transition = `transform ${BOARD_FLIP_MS}ms linear`;
        flip.el.style.transform = '';
      }
    });

    this.flipTimer = setTimeout(() => {
      for (const flip of flips) {
        flip.el.style.transition = '';
        flip.el.style.transform = '';
      }
      this.flipTimer = null;
    }, BOARD_FLIP_MS + 40);
  }

  /**
   * Collects board cell elements in row-major order matching `board` indices.
   *
   * @returns NodeList-backed array of `.bingo-cell` elements.
   */
  private queryBoardCells(): HTMLElement[] {
    return Array.from(
      this.hostRef.nativeElement.querySelectorAll(
        '.bingo-board > .bingo-cell',
      ),
    ) as HTMLElement[];
  }

  /**
   * Paints a square board-like tile onto a canvas and registers it as the drag image.
   *
   * @param event - Dragstart event to attach the custom drag image to.
   * @param character - Hanzi to paint.
   * @param pinyin - Pinyin to paint when the board toggle is on.
   */
  private setCanvasDragImage(
    event: DragEvent,
    character: string,
    pinyin: string,
  ): void {
    this.removeDragImageCanvas();

    const dpr = window.devicePixelRatio || 1;
    const size = DRAG_TILE_SIZE_PX;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    // Chrome requires the drag-image element to be in the DOM and rasterizable;
    // display/visibility/opacity none prevent that, so park it far off-screen.
    canvas.style.position = 'fixed';
    canvas.style.left = '-10000px';
    canvas.style.top = '0';
    canvas.style.pointerEvents = 'none';

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#1f2937';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    const radius = 6;

    // Rounded rectangle matching board tile chrome.
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.arcTo(size, 0, size, size, radius);
    ctx.arcTo(size, size, 0, size, radius);
    ctx.arcTo(0, size, 0, 0, radius);
    ctx.arcTo(0, 0, size, 0, radius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f5f5f7';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (this.showPinyinOnBoard) {
      ctx.font = '600 22px "Noto Sans SC", "PingFang SC", sans-serif';
      ctx.fillText(character, size / 2, size / 2 - 8);
      ctx.font = '12px Roboto, "Helvetica Neue", sans-serif';
      ctx.globalAlpha = 0.9;
      ctx.fillText(pinyin, size / 2, size / 2 + 14);
      ctx.globalAlpha = 1;
    } else {
      ctx.font = '600 26px "Noto Sans SC", "PingFang SC", sans-serif';
      ctx.fillText(character, size / 2, size / 2);
    }

    document.body.appendChild(canvas);
    this.dragImageCanvas = canvas;
    event.dataTransfer?.setDragImage(canvas, size / 2, size / 2);
  }

  /**
   * Detaches the temporary canvas used for setDragImage, if any.
   */
  private removeDragImageCanvas(): void {
    if (this.dragImageCanvas?.parentNode) {
      this.dragImageCanvas.parentNode.removeChild(this.dragImageCanvas);
    }

    this.dragImageCanvas = null;
  }

  /**
   * Clears a pending fade timeout if one is scheduled.
   */
  private clearFadeTimer(): void {
    if (this.fadeTimer !== null) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  /**
   * Clears a pending FLIP cleanup timeout if one is scheduled.
   */
  private clearFlipTimer(): void {
    if (this.flipTimer !== null) {
      clearTimeout(this.flipTimer);
      this.flipTimer = null;
    }
  }

  /**
   * Maps a place/clear/move failure reason to a short user-facing message.
   *
   * @param reason - Failure discriminator from PlaceEntryResult.
   * @returns Message suitable for the on-page error banner.
   */
  private placeErrorMessage(reason: string): string {
    switch (reason) {
      case 'cell_is_free':
        return 'The center FREE cell cannot hold a character.';
      case 'cell_not_empty':
        return 'That cell is already filled.';
      case 'duplicate_entry':
        return 'That entry is already on the board.';
      case 'entry_excluded':
        return 'Ineligible entries cannot be placed on the board.';
      case 'source_not_character':
        return 'Select a filled cell to move.';
      default:
        return 'Could not place that entry.';
    }
  }
}
