/**
 * Format Utilities Test Suite
 * Tests for currency and date formatting functions
 */

import {
  formatCurrency,
  formatCompactCurrency,
  formatDate,
  formatRelativeDate,
  formatPercent,
  getDaysRemaining,
} from '../../src/shared/utils/format';

describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    expect(formatCurrency(1000)).toBe('1,000원');
    expect(formatCurrency(1000000)).toBe('1,000,000원');
    expect(formatCurrency(12345)).toBe('12,345원');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('0원');
  });

  it('should format negative numbers correctly', () => {
    expect(formatCurrency(-1000)).toBe('-1,000원');
    expect(formatCurrency(-50000)).toBe('-50,000원');
  });

  it('should handle large numbers', () => {
    expect(formatCurrency(999999999)).toBe('999,999,999원');
  });
});

describe('formatCompactCurrency', () => {
  it('should format amounts over 100 million as 억원', () => {
    expect(formatCompactCurrency(100000000)).toBe('1.0억원');
    expect(formatCompactCurrency(250000000)).toBe('2.5억원');
  });

  it('should format amounts over 10,000 as 만원', () => {
    expect(formatCompactCurrency(10000)).toBe('1만원');
    expect(formatCompactCurrency(50000)).toBe('5만원');
    expect(formatCompactCurrency(120000)).toBe('12만원');
  });

  it('should use regular format for small amounts', () => {
    expect(formatCompactCurrency(9999)).toBe('9,999원');
    expect(formatCompactCurrency(1000)).toBe('1,000원');
  });
});

describe('formatDate', () => {
  it('should format date string correctly', () => {
    expect(formatDate('2026-01-15')).toBe('2026.01.15');
    expect(formatDate('2026-12-31')).toBe('2026.12.31');
  });

  it('should pad single digit months and days', () => {
    expect(formatDate('2026-01-05')).toBe('2026.01.05');
    expect(formatDate('2026-09-03')).toBe('2026.09.03');
  });
});

describe('formatPercent', () => {
  it('should format percentage correctly', () => {
    expect(formatPercent(50)).toBe('50%');
    expect(formatPercent(100)).toBe('100%');
    expect(formatPercent(0)).toBe('0%');
  });

  it('should round decimal percentages', () => {
    expect(formatPercent(33.33)).toBe('33%');
    expect(formatPercent(66.66)).toBe('67%');
    expect(formatPercent(99.9)).toBe('100%');
  });
});

describe('getDaysRemaining', () => {
  it('should return 0 for past dates', () => {
    const pastDate = '2020-01-01';
    expect(getDaysRemaining(pastDate)).toBe(0);
  });

  it('should return positive days for future dates', () => {
    // Create a date 10 days from now
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const futureString = future.toISOString().split('T')[0];

    const result = getDaysRemaining(futureString);
    expect(result).toBeGreaterThanOrEqual(9);
    expect(result).toBeLessThanOrEqual(11);
  });

  it('should return 0 for today', () => {
    const today = new Date().toISOString().split('T')[0];
    // Might be 0 or 1 depending on time of day
    expect(getDaysRemaining(today)).toBeLessThanOrEqual(1);
  });
});

describe('formatRelativeDate', () => {
  it('should return "오늘" for today', () => {
    const today = new Date().toISOString();
    expect(formatRelativeDate(today)).toBe('오늘');
  });

  it('should return "어제" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatRelativeDate(yesterday.toISOString())).toBe('어제');
  });

  it('should return "N일 전" for recent dates', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(formatRelativeDate(threeDaysAgo.toISOString())).toBe('3일 전');
  });

  it('should return "N주 전" for weeks', () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    expect(formatRelativeDate(twoWeeksAgo.toISOString())).toBe('2주 전');
  });

  it('should return formatted date for old dates', () => {
    const oldDate = '2025-01-15T00:00:00.000Z';
    expect(formatRelativeDate(oldDate)).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });
});
