import { describe, expect, it } from 'vitest';
import { cn, formatNumber } from './utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
  });

  it('should merge Tailwind classes correctly', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle arrays and objects', () => {
    expect(cn(['flex', 'items-center'], { 'gap-2': true, 'gap-4': false })).toBe(
      'flex items-center gap-2'
    );
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
  });
});

describe('formatNumber utility', () => {
  it('should format numbers less than 1000 as-is', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(999)).toBe('999');
  });

  it('should format thousands with K suffix', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(999_999)).toBe('1000.0K');
  });

  it('should format millions with M suffix', () => {
    expect(formatNumber(1_000_000)).toBe('1.0M');
    expect(formatNumber(2_500_000)).toBe('2.5M');
    expect(formatNumber(10_000_000)).toBe('10.0M');
  });

  it('should handle edge cases', () => {
    expect(formatNumber(1001)).toBe('1.0K');
    expect(formatNumber(1_500_000)).toBe('1.5M');
  });
});
