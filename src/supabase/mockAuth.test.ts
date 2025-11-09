import { describe, it, expect, beforeEach } from 'vitest';
import MockAuth from './mockAuth';

describe('MockAuth', () => {
  let auth: MockAuth;

  beforeEach(() => {
    localStorage.clear();
    auth = new MockAuth();
  });

  describe('signInAnonymously', () => {
    it('creates an anonymous session', async () => {
      const result = await auth.signInAnonymously();
      
      expect(result.data.session).toBeDefined();
      expect(result.data.user?.is_anonymous).toBe(true);
      expect(result.error).toBeNull();
    });

    it('stores session in localStorage', async () => {
      await auth.signInAnonymously();
      const session = await auth.getSession();
      
      expect(session.data.session).toBeDefined();
    });
  });

  describe('signInWithPassword', () => {
    it('creates a session with email/password', async () => {
      const result = await auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });
      
      expect(result.data.session).toBeDefined();
      expect(result.data.user?.email).toBe('test@example.com');
      expect(result.error).toBeNull();
    });
  });

  describe('signUp', () => {
    it('creates a new user', async () => {
      const result = await auth.signUp({
        email: 'new@example.com',
        password: 'password123',
      });
      
      expect(result.data.user?.email).toBe('new@example.com');
      expect(result.error).toBeNull();
    });
  });

  describe('signOut', () => {
    it('removes session from localStorage', async () => {
      await auth.signInAnonymously();
      await auth.signOut();
      
      const session = await auth.getSession();
      expect(session.data.session).toBeNull();
    });
  });

  describe('getUser', () => {
    it('returns null when not signed in', async () => {
      const result = await auth.getUser();
      expect(result.data.user).toBeNull();
    });

    it('returns user when signed in', async () => {
      await auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });
      
      const result = await auth.getUser();
      expect(result.data.user?.email).toBe('test@example.com');
    });
  });
});
