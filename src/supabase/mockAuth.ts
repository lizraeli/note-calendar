/**
 * Mock authentication system that mimics Supabase Auth API
 */

import { Session, User, AuthError } from '@supabase/supabase-js';
import { getFromStorage, saveToStorage, removeFromStorage, STORAGE_KEYS, getNextId } from './localStorage';

type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';
type AuthChangeCallback = (event: AuthChangeEvent, session: Session | null) => void;

class MockAuth {
  private listeners: Set<AuthChangeCallback> = new Set();

  /**
   * Get the current session from localStorage
   */
  async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
    const session = getFromStorage<Session>(STORAGE_KEYS.SESSION);
    return {
      data: { session },
      error: null,
    };
  }

  /**
   * Get the current user from the session
   */
  async getUser(): Promise<{ data: { user: User | null }; error: AuthError | null }> {
    const session = getFromStorage<Session>(STORAGE_KEYS.SESSION);
    return {
      data: { user: session?.user || null },
      error: null,
    };
  }

  /**
   * Sign in anonymously (create a guest user)
   */
  async signInAnonymously(): Promise<{ data: { session: Session | null; user: User | null }; error: AuthError | null }> {
    const userId = `anon-${getNextId(STORAGE_KEYS.USER_ID_COUNTER)}`;
    const user: User = {
      id: userId,
      aud: 'authenticated',
      role: 'authenticated',
      email: undefined,
      is_anonymous: true,
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
    };

    const session: Session = {
      access_token: `mock-token-${Date.now()}`,
      refresh_token: `mock-refresh-${Date.now()}`,
      expires_in: 3600,
      token_type: 'bearer',
      user,
    };

    saveToStorage(STORAGE_KEYS.SESSION, session);
    this.notifyListeners('SIGNED_IN', session);

    return {
      data: { session, user },
      error: null,
    };
  }

  /**
   * Sign in with email and password (mock implementation)
   */
  async signInWithPassword(credentials: { email: string; password: string }): Promise<{
    data: { session: Session | null; user: User | null };
    error: AuthError | null;
  }> {
    const userId = `user-${getNextId(STORAGE_KEYS.USER_ID_COUNTER)}`;
    const user: User = {
      id: userId,
      aud: 'authenticated',
      role: 'authenticated',
      email: credentials.email,
      is_anonymous: false,
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
    };

    const session: Session = {
      access_token: `mock-token-${Date.now()}`,
      refresh_token: `mock-refresh-${Date.now()}`,
      expires_in: 3600,
      token_type: 'bearer',
      user,
    };

    saveToStorage(STORAGE_KEYS.SESSION, session);
    this.notifyListeners('SIGNED_IN', session);

    return {
      data: { session, user },
      error: null,
    };
  }

  /**
   * Sign up with email and password (mock implementation)
   */
  async signUp(credentials: { email: string; password: string }): Promise<{
    data: { session: Session | null; user: User | null };
    error: AuthError | null;
  }> {
    // For mock purposes, signup is the same as signin
    return this.signInWithPassword(credentials);
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    removeFromStorage(STORAGE_KEYS.SESSION);
    this.notifyListeners('SIGNED_OUT', null);
    return { error: null };
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: AuthChangeCallback): { data: { subscription: { unsubscribe: () => void } } } {
    this.listeners.add(callback);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners.delete(callback);
          },
        },
      },
    };
  }

  /**
   * Notify all listeners of auth state changes
   */
  private notifyListeners(event: AuthChangeEvent, session: Session | null): void {
    this.listeners.forEach((callback) => {
      try {
        callback(event, session);
      } catch (error) {
        console.error('Error in auth state change listener:', error);
      }
    });
  }
}

export default MockAuth;
