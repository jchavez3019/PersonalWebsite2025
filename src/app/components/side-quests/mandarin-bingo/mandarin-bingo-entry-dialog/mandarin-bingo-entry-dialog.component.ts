/**
 * MatDialog form for adding or editing a custom Mandarin bingo vocabulary entry.
 */

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { map, Observable, startWith } from 'rxjs';

import { MAX_CUSTOM_LABEL_LENGTH } from '../mandarin-bingo.constants';
import { validateCustomLabel } from '../mandarin-bingo-eligibility';

/**
 * Payload passed into the add/edit vocabulary dialog.
 */
export interface MandarinBingoEntryDialogData {
  /** Dialog mode: create a new custom row or edit an existing one. */
  mode: 'add' | 'edit';
  /** Prefilled character when editing; empty for add. */
  character: string;
  /** Prefilled pinyin when editing; empty for add. */
  pinyin: string;
  /** Prefilled English translation when editing; empty for add. */
  translation: string;
  /** Prefilled label when editing; empty for add / unlabeled. */
  label: string;
  /** Existing custom labels for autocomplete suggestions. */
  customLabels: string[];
  /** Labels reserved by preset-class rows. */
  reservedLabels: string[];
  /** Entry id when editing; null when adding. */
  entryId: string | null;
}

/**
 * Result returned when the user saves the dialog form.
 */
export interface MandarinBingoEntryDialogResult {
  character: string;
  pinyin: string;
  translation: string;
  label: string;
  entryId: string | null;
}

/**
 * Reactive-form dialog for custom vocabulary add/edit.
 */
@Component({
  selector: 'app-mandarin-bingo-entry-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './mandarin-bingo-entry-dialog.component.html',
  styleUrl: './mandarin-bingo-entry-dialog.component.css',
})
export class MandarinBingoEntryDialogComponent implements OnInit {
  private readonly dialogRef = inject(
    MatDialogRef<
      MandarinBingoEntryDialogComponent,
      MandarinBingoEntryDialogResult | undefined
    >,
  );
  private readonly formBuilder = inject(FormBuilder);
  readonly data = inject<MandarinBingoEntryDialogData>(MAT_DIALOG_DATA);

  /** Reactive form backing the dialog fields. */
  readonly form: FormGroup = this.formBuilder.group({
    character: [this.data.character, Validators.required],
    pinyin: [this.data.pinyin, Validators.required],
    translation: [this.data.translation, Validators.required],
    label: [this.data.label],
  });

  /** Filtered custom label suggestions for MatAutocomplete. */
  filteredLabels$!: Observable<string[]>;

  /** Inline validation message for reserved / overlong labels. */
  labelError: string | null = null;

  /**
   * Wires label autocomplete filtering from the form control value stream.
   */
  ngOnInit(): void {
    const labelControl = this.form.get('label');
    if (!labelControl) {
      return;
    }

    this.filteredLabels$ = labelControl.valueChanges.pipe(
      startWith(labelControl.value ?? ''),
      map((value: string) => this.filterLabels(value ?? '')),
    );
  }

  /**
   * Dialog title reflecting add vs edit mode.
   *
   * @returns User-facing title string.
   */
  get title(): string {
    return this.data.mode === 'add' ? 'Add custom word' : 'Edit custom word';
  }

  /**
   * Closes the dialog without saving.
   */
  cancel(): void {
    this.dialogRef.close(undefined);
  }

  /**
   * Validates and closes with the trimmed form values when valid.
   */
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const character = String(this.form.value.character ?? '').trim();
    const pinyin = String(this.form.value.pinyin ?? '').trim();
    const translation = String(this.form.value.translation ?? '').trim();
    const label = String(this.form.value.label ?? '').trim();

    if (!character || !pinyin || !translation) {
      return;
    }

    const reserved = new Set(this.data.reservedLabels);
    const labelError = validateCustomLabel(
      label,
      reserved,
      MAX_CUSTOM_LABEL_LENGTH,
    );
    if (labelError) {
      this.labelError = labelError;
      return;
    }

    this.labelError = null;
    this.dialogRef.close({
      character,
      pinyin,
      translation,
      label,
      entryId: this.data.entryId,
    });
  }

  /**
   * Filters autocomplete options by a case-insensitive substring of the typed value.
   *
   * @param value - Current label input text.
   * @returns Matching custom labels.
   */
  private filterLabels(value: string): string[] {
    const needle = value.trim().toLowerCase();
    if (!needle) {
      return this.data.customLabels;
    }

    return this.data.customLabels.filter((label) =>
      label.toLowerCase().includes(needle),
    );
  }
}
