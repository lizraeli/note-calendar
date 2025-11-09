/**
 * Simple test to verify test infrastructure is working
 */

import { describe, it, expect } from 'vitest';

describe('Test Infrastructure', () => {
  it('should run basic assertions', () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
  });

  it('should have access to localStorage', () => {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
  });
});
