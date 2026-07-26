/**
 * Lean Mandarin bingo component tests covering eligibility UX and Option A.
 */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MandarinBingoComponent } from './mandarin-bingo.component';
import { MANDARIN_BINGO_STORAGE_KEY, PRESET_LABEL } from './mandarin-bingo.constants';
import { placeEntryOnBoard } from './mandarin-bingo-board';

describe('MandarinBingoComponent', () => {
  let component: MandarinBingoComponent;
  let fixture: ComponentFixture<MandarinBingoComponent>;

  beforeEach(async () => {
    localStorage.removeItem(MANDARIN_BINGO_STORAGE_KEY);

    await TestBed.configureTestingModule({
      imports: [MandarinBingoComponent, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MandarinBingoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem(MANDARIN_BINGO_STORAGE_KEY);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('test_exclude_clears_matching_board_cell', fakeAsync(() => {
    /**
     * Given an entry placed on the board
     * When it is excluded via excludedByUser
     * Then that board cell becomes empty after fade
     */
    const entry = component.entries[0];
    component.selectedEntryId = entry.id;
    component.onCellClick(0);
    expect(component.board[0].kind).toBe('character');

    component.setExcluded(entry, true);
    tick(250);
    expect(component.board[0].kind).toBe('empty');
    expect(
      component.entries.find((row) => row.id === entry.id)?.excludedByUser,
    ).toBeTrue();
  }));

  it('test_option_a_blocks_uncheck_when_label_inactive', () => {
    /**
     * Given Lesson 5 deactivated in Active labels
     * When setExcluded tries to clear the bench
     * Then excludedByUser is unchanged and an error toast is shown
     */
    const entry = component.entries[0];
    const openSpy = spyOn(
      (component as unknown as { snackBar: MatSnackBar }).snackBar,
      'open',
    );
    component.activeLabels = new Set();
    component.setExcluded(entry, false);
    expect(openSpy).toHaveBeenCalled();
    const message = openSpy.calls.mostRecent().args[0] as string;
    expect(message).toContain('Active labels');
    expect(entry.excludedByUser).toBeFalse();
  });

  it('test_reactivate_label_preserves_manual_excludedByUser', () => {
    /**
     * Given a manually excluded entry and deactivated then reactivated label
     * When Active labels include Lesson 5 again
     * Then the entry remains ineligible due to excludedByUser
     */
    const entry = component.entries[0];
    component.setExcluded(entry, true);
    component.activeLabels = new Set();
    component.activeLabels = new Set([PRESET_LABEL]);
    const updated = component.entries.find((row) => row.id === entry.id)!;
    expect(updated.excludedByUser).toBeTrue();
    expect(component.entryIsEligible(updated)).toBeFalse();
  });

  it('test_eligible_count_drops_when_label_deactivated', () => {
    /**
     * Given the full preset with Lesson 5 active
     * When Lesson 5 is deactivated
     * Then eligibleCount becomes 0
     */
    expect(component.eligibleCount).toBe(24);
    component.activeLabels = new Set();
    expect(component.eligibleCount).toBe(0);
  });

  it('test_refresh_semantics_default_active_labels_are_all_present', () => {
    /**
     * Given a freshly initialized component (simulating page load)
     * When activeLabels are inspected
     * Then all present labels including Lesson 5 are active
     */
    expect(component.activeLabels.has(PRESET_LABEL)).toBeTrue();
  });

  it('test_place_uses_eligibility_not_only_excludedByUser', () => {
    /**
     * Given Lesson 5 inactive and excludedByUser false
     * When placing the entry
     * Then placement fails as ineligible
     */
    const entry = component.entries[0];
    component.activeLabels = new Set();
    const result = placeEntryOnBoard(
      component.board,
      0,
      entry,
      (row) => component.entryIsEligible(row),
    );
    expect(result.ok).toBeFalse();
  });
});
