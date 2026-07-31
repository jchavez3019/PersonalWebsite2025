/**
 * Vocabulary sort helper unit tests (wave_1 spec 0009).
 */
import { sortVocabularyEntries } from './mandarin-bingo-sort';
import { MandarinBingoEntry } from './mandarin-bingo.types';

describe('mandarin-bingo-sort', () => {
  const entries: MandarinBingoEntry[] = [
    {
      id: '1',
      character: '乙',
      pinyin: 'yǐ',
      translation: 'second',
      source: 'custom',
      label: '',
      excludedByUser: false,
      createdAt: '2026-07-02T00:00:00.000Z',
      modifiedAt: '2026-07-03T00:00:00.000Z',
    },
    {
      id: '2',
      character: '甲',
      pinyin: 'jiǎ',
      translation: 'first',
      source: 'custom',
      label: 'Alpha',
      excludedByUser: false,
      createdAt: '2026-07-01T00:00:00.000Z',
      modifiedAt: '2026-07-04T00:00:00.000Z',
    },
  ];

  it('test_sort_by_pinyin_asc_orders_jia_before_yi', () => {
    /**
     * Given two customs with distinct pinyin
     * When sorted by pinyin asc
     * Then jiǎ precedes yǐ
     */
    const sorted = sortVocabularyEntries(entries, 'pinyin', 'asc');
    expect(sorted.map((e) => e.id)).toEqual(['2', '1']);
  });

  it('test_sort_by_label_asc_puts_unlabeled_last', () => {
    /**
     * Given one labeled and one unlabeled entry
     * When sorted by label asc
     * Then unlabeled sorts last
     */
    const sorted = sortVocabularyEntries(entries, 'label', 'asc');
    expect(sorted[sorted.length - 1].label).toBe('');
  });

  it('test_sort_by_modified_desc_puts_newest_first', () => {
    /**
     * Given two modified timestamps
     * When sorted by modified desc
     * Then the later modifiedAt comes first
     */
    const sorted = sortVocabularyEntries(entries, 'modified', 'desc');
    expect(sorted[0].id).toBe('2');
  });
});
