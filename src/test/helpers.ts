/**
 * Test helper utilities and mock factories
 */

import { Session, User } from '@supabase/supabase-js';
import { Tables } from '../supabase/types';

type Note = Tables<'notes'>;

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides?: Partial<User>): User {
  const defaults: User = {
    id: 'user-123',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'test@example.com',
    is_anonymous: false,
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
  };

  return { ...defaults, ...overrides };
}

/**
 * Create a mock anonymous user for testing
 */
export function createMockAnonymousUser(overrides?: Partial<User>): User {
  return createMockUser({
    id: 'anon-456',
    email: undefined,
    is_anonymous: true,
    ...overrides,
  });
}

/**
 * Create a mock session for testing
 */
export function createMockSession(user?: User): Session {
  const mockUser = user || createMockUser();
  
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  };
}

/**
 * Create a mock note for testing
 */
export function createMockNote(overrides?: Partial<Note>): Note {
  const defaults: Note = {
    id: 1,
    date: new Date('2025-11-08').toISOString(),
    content: '<p>Test note content</p>',
    user_uid: 'user-123',
    created_at: new Date().toISOString(),
  };

  return { ...defaults, ...overrides };
}

/**
 * Create multiple mock notes for testing
 */
export function createMockNotes(count: number, overrides?: Partial<Note>): Note[] {
  return Array.from({ length: count }, (_, i) =>
    createMockNote({
      id: i + 1,
      date: new Date(2025, 10, i + 1).toISOString(), // Nov 1-count, 2025
      content: `<p>Note ${i + 1} content</p>`,
      ...overrides,
    })
  );
}

/**
 * Setup localStorage with a mock session
 */
export function setupMockSession(user?: User): void {
  const session = createMockSession(user);
  localStorage.setItem('mock_session', JSON.stringify(session));
}

/**
 * Setup localStorage with mock notes
 */
export function setupMockNotes(notes: Note[]): void {
  localStorage.setItem('mock_notes', JSON.stringify(notes));
}

/**
 * Clear all mock data from localStorage
 */
export function clearMockData(): void {
  localStorage.clear();
}

/**
 * Wait for async updates to complete
 * Useful for waiting for state updates in React components
 */
export function waitFor(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
