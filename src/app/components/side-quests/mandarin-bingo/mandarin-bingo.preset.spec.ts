/**
 * Preset vocabulary sanity checks (wave_1 spec 0006).
 */
import { PRESET_LABEL } from './mandarin-bingo.constants';
import { MANDARIN_BINGO_PRESET } from './mandarin-bingo.preset';

describe('MANDARIN_BINGO_PRESET', () => {
  it('test_preset_has_exactly_24_unique_entries_with_required_fields', () => {
    /**
     * Given the verified preset constant
     * When each row is inspected
     * Then length is 24 with unique ids/characters and required extended v1 fields
     */
    expect(MANDARIN_BINGO_PRESET.length).toBe(24);

    const ids = new Set<string>();
    const characters = new Set<string>();

    for (const entry of MANDARIN_BINGO_PRESET) {
      expect(entry.id.length).toBeGreaterThan(0);
      expect(entry.character.length).toBeGreaterThan(0);
      expect(entry.pinyin.length).toBeGreaterThan(0);
      expect(entry.translation.length).toBeGreaterThan(0);
      expect(entry.source).toBe('preset');
      expect(entry.label).toBe(PRESET_LABEL);
      expect(entry.excludedByUser).toBe(false);
      expect(entry.createdAt.length).toBeGreaterThan(0);
      expect(entry.modifiedAt.length).toBeGreaterThan(0);
      ids.add(entry.id);
      characters.add(entry.character);
    }

    expect(ids.size).toBe(24);
    expect(characters.size).toBe(24);
  });

  it('test_preset_spot_checks_known_traditional_rows', () => {
    /**
     * Given the verified preset constant
     * When known teaching rows are looked up
     * Then 這/zhè, 老師/lǎoshī, and 加州/Jiāzhōu are present
     */
    expect(MANDARIN_BINGO_PRESET.some((e) => e.character === '這' && e.pinyin === 'zhè')).toBeTrue();
    expect(MANDARIN_BINGO_PRESET.some((e) => e.character === '老師' && e.pinyin === 'lǎoshī')).toBeTrue();
    expect(MANDARIN_BINGO_PRESET.some((e) => e.character === '加州' && e.pinyin === 'Jiāzhōu')).toBeTrue();
  });
});
