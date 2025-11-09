/**
 * Mock Supabase client that provides the same API as the real Supabase client
 */

import { Database } from './types';
import MockAuth from './mockAuth';
import MockQueryBuilder from './mockQueryBuilder';

class MockSupabaseClient {
  public auth: MockAuth;

  constructor() {
    this.auth = new MockAuth();
  }

  /**
   * Get a query builder for a specific table
   */
  from<T extends keyof Database['public']['Tables']>(table: T): MockQueryBuilder<T> {
    return new MockQueryBuilder(table);
  }
}

export default MockSupabaseClient;
