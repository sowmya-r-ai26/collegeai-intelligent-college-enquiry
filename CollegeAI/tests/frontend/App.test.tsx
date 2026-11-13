import { describe, expect, it } from 'vitest';

describe('CollegeAI Frontend Smoke Suite', () => {
  it('validates application reference format', () => {
    const pattern = /^VETIAS-2026-APP-\d{4,}$/;
    expect(pattern.test('VETIAS-2026-APP-4821')).toBe(true);
    expect(pattern.test('INVALID-123')).toBe(false);
  });
});
