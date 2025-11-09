import { describe, it, expect } from 'vitest';
import {
  dateToString,
  stringToDate,
  monthAndYearToDate,
  monthYearAndDayToDate,
  getDaysInMonth,
  isElementInViewport,
} from './utils';

describe('dateToString', () => {
  it('converts a date to yyyy-MM-dd format', () => {
    const date = new Date(2025, 10, 8); // November 8, 2025
    expect(dateToString(date)).toBe('2025-11-08');
  });

  it('pads single-digit months and days with zeros', () => {
    const date = new Date(2025, 0, 5); // January 5, 2025
    expect(dateToString(date)).toBe('2025-01-05');
  });

  it('handles leap year dates', () => {
    const date = new Date(2024, 1, 29); // February 29, 2024
    expect(dateToString(date)).toBe('2024-02-29');
  });
});

describe('stringToDate', () => {
  it('parses yyyy-MM-dd format to Date', () => {
    const date = stringToDate('2025-11-08');
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(10); // November is month 10 (0-indexed)
    expect(date.getDate()).toBe(8);
  });

  it('handles dates with single-digit months and days', () => {
    const date = stringToDate('2025-01-05');
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(0); // January
    expect(date.getDate()).toBe(5);
  });

  it('handles leap year dates', () => {
    const date = stringToDate('2024-02-29');
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(1); // February
    expect(date.getDate()).toBe(29);
  });
});

describe('dateToString and stringToDate round-trip', () => {
  it('maintains date integrity in round-trip conversion', () => {
    const originalDate = new Date(2025, 10, 8);
    const dateString = dateToString(originalDate);
    const parsedDate = stringToDate(dateString);
    
    expect(parsedDate.getFullYear()).toBe(originalDate.getFullYear());
    expect(parsedDate.getMonth()).toBe(originalDate.getMonth());
    expect(parsedDate.getDate()).toBe(originalDate.getDate());
  });
});

describe('monthAndYearToDate', () => {
  it('creates a date for the first day of the month', () => {
    const date = monthAndYearToDate(11, 2025); // November 2025
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(10); // November is month 10 (0-indexed)
    expect(date.getDate()).toBe(1); // First day
  });

  it('handles January (month 1)', () => {
    const date = monthAndYearToDate(1, 2025);
    expect(date.getMonth()).toBe(0); // January is month 0
  });

  it('handles December (month 12)', () => {
    const date = monthAndYearToDate(12, 2025);
    expect(date.getMonth()).toBe(11); // December is month 11
  });
});

describe('monthYearAndDayToDate', () => {
  it('creates a date with the specified day', () => {
    const date = monthYearAndDayToDate(11, 2025, 8); // November 8, 2025
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(10);
    expect(date.getDate()).toBe(8);
  });

  it('handles the last day of the month', () => {
    const date = monthYearAndDayToDate(11, 2025, 30); // November 30, 2025
    expect(date.getDate()).toBe(30);
  });

  it('handles February 29 in a leap year', () => {
    const date = monthYearAndDayToDate(2, 2024, 29); // February 29, 2024
    expect(date.getMonth()).toBe(1); // February
    expect(date.getDate()).toBe(29);
  });
});

describe('getDaysInMonth', () => {
  it('returns correct number of days for November 2025', () => {
    const days = getDaysInMonth(11, 2025);
    expect(days).toHaveLength(30);
  });

  it('returns correct number of days for January 2025', () => {
    const days = getDaysInMonth(1, 2025);
    expect(days).toHaveLength(31);
  });

  it('returns 28 days for February in a non-leap year', () => {
    const days = getDaysInMonth(2, 2025);
    expect(days).toHaveLength(28);
  });

  it('returns 29 days for February in a leap year', () => {
    const days = getDaysInMonth(2, 2024);
    expect(days).toHaveLength(29);
  });

  it('returns Date objects with sequential dates', () => {
    const days = getDaysInMonth(11, 2025);
    expect(days[0].getDate()).toBe(1);
    expect(days[1].getDate()).toBe(2);
    expect(days[29].getDate()).toBe(30);
  });

  it('all dates are in the correct month', () => {
    const days = getDaysInMonth(11, 2025);
    days.forEach(day => {
      expect(day.getMonth()).toBe(10); // November
      expect(day.getFullYear()).toBe(2025);
    });
  });
});

describe('isElementInViewport', () => {
  it('returns true for element fully in viewport', () => {
    const mockElement = {
      getBoundingClientRect: () => ({
        top: 100,
        left: 100,
        bottom: 200,
        right: 200,
      }),
    } as Element;

    // Mock window dimensions
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });

    expect(isElementInViewport(mockElement)).toBe(true);
  });

  it('returns false for element above viewport', () => {
    const mockElement = {
      getBoundingClientRect: () => ({
        top: -100,
        left: 100,
        bottom: -10,
        right: 200,
      }),
    } as Element;

    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });

    expect(isElementInViewport(mockElement)).toBe(false);
  });

  it('returns false for element below viewport', () => {
    const mockElement = {
      getBoundingClientRect: () => ({
        top: 900,
        left: 100,
        bottom: 1000,
        right: 200,
      }),
    } as Element;

    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });

    expect(isElementInViewport(mockElement)).toBe(false);
  });

  it('returns false for element to the left of viewport', () => {
    const mockElement = {
      getBoundingClientRect: () => ({
        top: 100,
        left: -100,
        bottom: 200,
        right: -10,
      }),
    } as Element;

    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });

    expect(isElementInViewport(mockElement)).toBe(false);
  });

  it('returns false for element to the right of viewport', () => {
    const mockElement = {
      getBoundingClientRect: () => ({
        top: 100,
        left: 1300,
        bottom: 200,
        right: 1400,
      }),
    } as Element;

    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });

    expect(isElementInViewport(mockElement)).toBe(false);
  });

  it('returns true for element at viewport edges', () => {
    const mockElement = {
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        bottom: 800,
        right: 1200,
      }),
    } as Element;

    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });

    expect(isElementInViewport(mockElement)).toBe(true);
  });
});
