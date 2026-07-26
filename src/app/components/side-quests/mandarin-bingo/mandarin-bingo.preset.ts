/**
 * Verified traditional Mandarin preset vocabulary (wave_1 spec 0002).
 * Stable UUIDs are assigned at authoring time and must not change across boots.
 */

import {
  PRESET_CREATED_AT,
  PRESET_LABEL,
  PRESET_MODIFIED_AT,
} from './mandarin-bingo.constants';
import { MandarinBingoEntry } from './mandarin-bingo.types';

/**
 * Shared field defaults for every shipped preset row.
 */
const PRESET_DEFAULTS = {
  source: 'preset' as const,
  label: PRESET_LABEL,
  excludedByUser: false,
  createdAt: PRESET_CREATED_AT,
  modifiedAt: PRESET_MODIFIED_AT,
};

/**
 * Shipped teaching deck used for first load and Reset to preset.
 */
export const MANDARIN_BINGO_PRESET: readonly MandarinBingoEntry[] = [
  { id: 'a1000001-0000-4000-8000-000000000001', character: '這', pinyin: 'zhè', translation: 'this', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000002', character: '朋友', pinyin: 'péngyǒu', translation: 'friend', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000003', character: '認識', pinyin: 'rènshí', translation: 'to know, meet, recognize', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000004', character: '高興', pinyin: 'gāoxìng', translation: 'happy, glad', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000005', character: '平常', pinyin: 'píngcháng', translation: 'usually, normally', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000006', character: '住在', pinyin: 'zhù zài', translation: 'to live in/at', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000007', character: '現在', pinyin: 'xiànzài', translation: 'now', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000008', character: '學校', pinyin: 'xuéxiào', translation: 'school', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000009', character: '放假', pinyin: 'fàngjià', translation: 'to be on school break, to be on vacation', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-00000000000a', character: '來', pinyin: 'lái', translation: 'to come', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-00000000000b', character: '玩', pinyin: 'wán', translation: 'to have fun, to play', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-00000000000c', character: '歡迎', pinyin: 'huānyíng', translation: 'to welcome', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-00000000000d', character: '想', pinyin: 'xiǎng', translation: 'would like, to want, to have a desire to', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-00000000000e', character: '去', pinyin: 'qù', translation: 'to go', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-00000000000f', character: '國家', pinyin: 'guójiā', translation: 'nation, country', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000010', character: '公園', pinyin: 'gōngyuán', translation: 'park', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000011', character: '好久不見', pinyin: 'hǎojiǔ bújiàn', translation: 'long time no see', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000012', character: '迪士尼樂園', pinyin: 'Díshìní lèyuán', translation: 'Disneyland', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000013', character: '臺北', pinyin: 'Táiběi', translation: 'Taipei', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000014', character: '加州', pinyin: 'Jiāzhōu', translation: 'California', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000015', character: '誰', pinyin: 'shéi', translation: 'who, whom', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000016', character: '父母', pinyin: 'fùmǔ', translation: 'parents (formal)', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000017', character: '每天', pinyin: 'měitiān', translation: 'every day', ...PRESET_DEFAULTS },
  { id: 'a1000001-0000-4000-8000-000000000018', character: '老師', pinyin: 'lǎoshī', translation: 'teacher', ...PRESET_DEFAULTS },
];

/**
 * Returns a deep clone of the shipped preset for factory reset and default load.
 *
 * @returns A mutable copy of every preset entry with identical field values.
 */
export function cloneMandarinBingoPreset(): MandarinBingoEntry[] {
  return MANDARIN_BINGO_PRESET.map((entry) => ({ ...entry }));
}
