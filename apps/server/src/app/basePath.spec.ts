import { normalizeBasePath, normalizeGlobalPrefix } from './basePath';

describe('basePath helpers', () => {
  describe('normalizeBasePath', () => {
    it.each([
      [undefined, undefined],
      ['', undefined],
      ['/', undefined],
      ['maintainerr', '/maintainerr'],
      ['/maintainerr', '/maintainerr'],
      ['/maintainerr/', '/maintainerr'],
      ['///maintainerr///', '/maintainerr'],
    ])('normalizes %p to %p', (input, expected) => {
      expect(normalizeBasePath(input)).toBe(expected);
    });
  });

  describe('normalizeGlobalPrefix', () => {
    it.each([
      [undefined, undefined],
      ['', undefined],
      ['/', undefined],
      ['maintainerr', 'maintainerr'],
      ['/maintainerr/', 'maintainerr'],
    ])('normalizes %p to %p', (input, expected) => {
      expect(normalizeGlobalPrefix(input)).toBe(expected);
    });
  });
});