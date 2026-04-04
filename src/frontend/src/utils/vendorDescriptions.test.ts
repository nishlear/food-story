import { describe, expect, it } from 'vitest';
import { getDescriptionForLanguage } from './vendorDescriptions';

describe('getDescriptionForLanguage', () => {
  it('returns the current language when available', () => {
    expect(getDescriptionForLanguage({
      vi: 'Mo ta',
      en: 'Description',
    }, 'en')).toBe('Description');
  });

  it('falls back to Vietnamese before English', () => {
    expect(getDescriptionForLanguage({
      vi: 'Mo ta',
      en: 'Description',
    }, 'ja')).toBe('Mo ta');
  });

  it('returns null when every translation is empty', () => {
    expect(getDescriptionForLanguage({
      vi: '   ',
      en: '',
    }, 'vi')).toBeNull();
  });
});
