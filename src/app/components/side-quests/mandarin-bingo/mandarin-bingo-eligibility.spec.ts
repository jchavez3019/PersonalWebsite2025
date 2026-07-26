/**
 * Eligibility helper unit tests (wave_1 specs 0008 / 0006).
 */
import {
  collectCustomLabels,
  collectLabels,
  collectReservedLabels,
  countEligible,
  createDefaultActiveLabels,
  isEligible,
  labelIsActive,
  validateCustomLabel,
} from './mandarin-bingo-eligibility';
import { PRESET_LABEL } from './mandarin-bingo.constants';
import { MandarinBingoEntry } from './mandarin-bingo.types';

describe('mandarin-bingo-eligibility', () => {
  const preset: MandarinBingoEntry = {
    id: 'p1',
    character: '這',
    pinyin: 'zhè',
    translation: 'this',
    source: 'preset',
    label: PRESET_LABEL,
    excludedByUser: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    modifiedAt: '2026-01-01T00:00:00.000Z',
  };

  const custom: MandarinBingoEntry = {
    id: 'c1',
    character: '測',
    pinyin: 'cè',
    translation: 'test',
    source: 'custom',
    label: 'Homework',
    excludedByUser: false,
    createdAt: '2026-07-01T00:00:00.000Z',
    modifiedAt: '2026-07-01T00:00:00.000Z',
  };

  const unlabeled: MandarinBingoEntry = {
    ...custom,
    id: 'c2',
    character: '試',
    label: '',
  };

  it('test_deactivate_label_makes_entries_ineligible_without_changing_excludedByUser', () => {
    /**
     * Given an entry with excludedByUser false and label Lesson 5
     * When Lesson 5 is removed from activeLabels
     * Then the entry is ineligible and excludedByUser stays false
     */
    const active = new Set<string>(['Homework']);
    expect(isEligible(preset, active)).toBeFalse();
    expect(preset.excludedByUser).toBeFalse();
  });

  it('test_reactivate_label_preserves_excludedByUser_true', () => {
    /**
     * Given a manually benched entry under an inactive then reactivated label
     * When the label becomes active again
     * Then excludedByUser true keeps the entry ineligible
     */
    const benched = { ...preset, excludedByUser: true };
    const active = new Set<string>([PRESET_LABEL]);
    expect(labelIsActive(benched.label, active)).toBeTrue();
    expect(isEligible(benched, active)).toBeFalse();
  });

  it('test_empty_active_labels_yields_zero_eligible_count', () => {
    /**
     * Given vocabulary with multiple labels
     * When activeLabels is empty
     * Then eligible count is 0
     */
    expect(countEligible([preset, custom], new Set())).toBe(0);
  });

  it('test_x_over_n_counts_eligible_over_total', () => {
    /**
     * Given one eligible and one excludedByUser entry with active labels
     * When counts are computed
     * Then eligible is 1 and total remains 2
     */
    const entries = [preset, { ...custom, excludedByUser: true }];
    const active = createDefaultActiveLabels(entries);
    expect(countEligible(entries, active)).toBe(1);
    expect(entries.length).toBe(2);
  });

  it('test_collect_labels_puts_unlabeled_last', () => {
    /**
     * Given labeled and unlabeled entries
     * When collectLabels runs
     * Then empty string appears last
     */
    const labels = collectLabels([custom, unlabeled, preset]);
    expect(labels[labels.length - 1]).toBe('');
    expect(labels).toContain(PRESET_LABEL);
    expect(labels).toContain('Homework');
  });

  it('test_create_default_active_labels_includes_all_present_labels', () => {
    /**
     * Given a mixed vocabulary list
     * When createDefaultActiveLabels runs
     * Then every present label including Unlabeled is active
     */
    const active = createDefaultActiveLabels([preset, custom, unlabeled]);
    expect(active.has(PRESET_LABEL)).toBeTrue();
    expect(active.has('Homework')).toBeTrue();
    expect(active.has('')).toBeTrue();
  });

  it('test_reserved_labels_are_preset_class_labels_only', () => {
    /**
     * Given preset Lesson 5 and custom Homework
     * When collectReservedLabels runs
     * Then only Lesson 5 is reserved
     */
    const reserved = collectReservedLabels([preset, custom]);
    expect(reserved.has(PRESET_LABEL)).toBeTrue();
    expect(reserved.has('Homework')).toBeFalse();
  });

  it('test_validate_custom_label_rejects_reserved_and_overlong', () => {
    /**
     * Given reserved Lesson 5
     * When a custom tries to use it or exceeds max length
     * Then validateCustomLabel returns an error message
     */
    const reserved = new Set([PRESET_LABEL]);
    expect(validateCustomLabel(PRESET_LABEL, reserved, 15)).not.toBeNull();
    expect(validateCustomLabel('abcdefghijklmnop', reserved, 15)).not.toBeNull();
    expect(validateCustomLabel('Homework', reserved, 15)).toBeNull();
    expect(validateCustomLabel('', reserved, 15)).toBeNull();
  });

  it('test_collect_custom_labels_excludes_preset_and_empty', () => {
    /**
     * Given preset, labeled custom, and unlabeled custom
     * When collectCustomLabels runs
     * Then only non-empty custom labels are returned
     */
    expect(collectCustomLabels([preset, custom, unlabeled])).toEqual(['Homework']);
  });
});
