/**
 * MatDialog for toggling session Active labels (include-set) via pill zones.
 */

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

/**
 * Payload for the Active labels dialog.
 */
export interface MandarinBingoActiveLabelsDialogData {
  /** All labels currently present among vocabulary entries. */
  availableLabels: string[];
  /** Currently active labels (session include-set). */
  activeLabels: string[];
}

/** Drag payload prefix for label pills. */
const LABEL_DRAG_PREFIX = 'label:';

/**
 * Multi-select dialog for session Active labels using wrapping pills.
 */
@Component({
  selector: 'app-mandarin-bingo-active-labels-dialog',
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './mandarin-bingo-active-labels-dialog.component.html',
  styleUrl: './mandarin-bingo-active-labels-dialog.component.css',
})
export class MandarinBingoActiveLabelsDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<MandarinBingoActiveLabelsDialogComponent, string[] | undefined>,
  );
  readonly data = inject<MandarinBingoActiveLabelsDialogData>(MAT_DIALOG_DATA);

  /** Working active label set (mutated until Apply / Cancel). */
  activeWorking = new Set<string>();

  constructor() {
    this.activeWorking = new Set(this.data.activeLabels);
  }

  /**
   * Active labels in stable available-order for the upper zone.
   *
   * @returns Labels currently in the working active set.
   */
  get activePills(): string[] {
    return this.data.availableLabels.filter((label) =>
      this.activeWorking.has(label),
    );
  }

  /**
   * Inactive labels in stable available-order for the lower zone.
   *
   * @returns Labels not in the working active set.
   */
  get inactivePills(): string[] {
    return this.data.availableLabels.filter(
      (label) => !this.activeWorking.has(label),
    );
  }

  /**
   * Human-readable label for a raw label key (Unlabeled for empty string).
   *
   * @param label - Raw label value.
   * @returns Display string for the pill.
   */
  displayLabel(label: string): string {
    return label === '' ? 'Unlabeled' : label;
  }

  /**
   * Activates a label (click inactive pill, or drop into active zone).
   *
   * @param label - Label to activate.
   * @param event - Optional click event to stop pill drag interference.
   */
  activate(label: string, event?: Event): void {
    event?.stopPropagation();
    this.activeWorking = new Set([...this.activeWorking, label]);
  }

  /**
   * Deactivates a label (× on active pill, or drop into inactive zone).
   *
   * @param label - Label to deactivate.
   * @param event - Optional click event so × does not also drag.
   */
  deactivate(label: string, event?: Event): void {
    event?.stopPropagation();
    const next = new Set(this.activeWorking);
    next.delete(label);
    this.activeWorking = next;
  }

  /**
   * Starts dragging a label pill between zones.
   *
   * @param event - Browser dragstart event.
   * @param label - Label being dragged.
   */
  onPillDragStart(event: DragEvent, label: string): void {
    event.dataTransfer?.setData('text/plain', `${LABEL_DRAG_PREFIX}${label}`);
    event.dataTransfer!.effectAllowed = 'move';
  }

  /**
   * Allows drops onto a zone.
   *
   * @param event - Browser dragover event.
   */
  onZoneDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  /**
   * Drops a pill into the active zone.
   *
   * @param event - Browser drop event.
   */
  onActiveZoneDrop(event: DragEvent): void {
    event.preventDefault();
    const label = this.readDraggedLabel(event);
    if (label !== null) {
      this.activate(label);
    }
  }

  /**
   * Drops a pill into the inactive zone.
   *
   * @param event - Browser drop event.
   */
  onInactiveZoneDrop(event: DragEvent): void {
    event.preventDefault();
    const label = this.readDraggedLabel(event);
    if (label !== null) {
      this.deactivate(label);
    }
  }

  /**
   * Closes without applying changes.
   */
  cancel(): void {
    this.dialogRef.close(undefined);
  }

  /**
   * Closes with the working active label list.
   */
  apply(): void {
    this.dialogRef.close([...this.activeWorking]);
  }

  /**
   * Reads a dragged label from the dataTransfer payload.
   *
   * @param event - Drop event.
   * @returns Label string, or null when the payload is not a pill drag.
   */
  private readDraggedLabel(event: DragEvent): string | null {
    const payload = event.dataTransfer?.getData('text/plain') ?? '';
    if (!payload.startsWith(LABEL_DRAG_PREFIX)) {
      return null;
    }

    return payload.slice(LABEL_DRAG_PREFIX.length);
  }
}
