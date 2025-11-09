/**
 * Mock query builder that mimics Supabase's database query API
 */

import { Database, Tables, TablesInsert, TablesUpdate } from './types';
import { getFromStorage, saveToStorage, STORAGE_KEYS, getNextId } from './localStorage';
import { Session } from '@supabase/supabase-js';

type PostgrestError = {
  message: string;
  details: string;
  hint: string;
  code: string;
};

type PostgrestResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

type TableRow = Record<string, unknown>;

class MockQueryBuilder<T extends keyof Database['public']['Tables']> {
  private tableName: T;
  private filters: Array<(item: TableRow) => boolean> = [];

  constructor(tableName: T) {
    this.tableName = tableName;
  }

  /**
   * Select fields (simplified - we always return all fields)
   */
  select(): this {
    return this;
  }

  /**
   * Filter by equality
   */
  eq(column: string, value: unknown): this {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  /**
   * Filter by greater than or equal
   */
  gte(column: string, value: unknown): this {
    this.filters.push((item) => {
      const itemValue = item[column];
      if ((typeof itemValue === 'string' || typeof itemValue === 'number') &&
          (typeof value === 'string' || typeof value === 'number')) {
        return itemValue >= value;
      }
      return false;
    });
    return this;
  }

  /**
   * Filter by less than
   */
  lt(column: string, value: unknown): this {
    this.filters.push((item) => {
      const itemValue = item[column];
      if ((typeof itemValue === 'string' || typeof itemValue === 'number') &&
          (typeof value === 'string' || typeof value === 'number')) {
        return itemValue < value;
      }
      return false;
    });
    return this;
  }

  /**
   * Execute the query and return results
   * This makes the query builder "thenable" like real Supabase queries
   */
  then<TResult1 = PostgrestResponse<Tables<T>[]>, TResult2 = never>(
    onfulfilled?: ((value: PostgrestResponse<Tables<T>[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const promise = this.executeSelect() as Promise<PostgrestResponse<Tables<T>[]>>;
    return promise.then(onfulfilled, onrejected);
  }

  /**
   * Insert a new record
   */
  insert(data: TablesInsert<T>): MockInsertBuilder<T> {
    return new MockInsertBuilder(this.tableName, data);
  }

  /**
   * Update records
   */
  update(data: Partial<TablesUpdate<T>>): MockUpdateBuilder<T> {
    return new MockUpdateBuilder(this.tableName, data, this.filters);
  }

  /**
   * Execute a SELECT query
   */
  private async executeSelect(): Promise<PostgrestResponse<Tables<T>[]>> {
    try {
      const storageKey = this.getStorageKey();
      let items = getFromStorage<TableRow[]>(storageKey) || [];

      // Apply filters
      items = items.filter((item) => {
        return this.filters.every((filter) => filter(item));
      });

      return {
        data: items as Tables<T>[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: '',
          hint: '',
          code: 'MOCK_ERROR',
        },
      };
    }
  }

  /**
   * Get localStorage key for the table
   */
  private getStorageKey(): string {
    if (this.tableName === 'notes') {
      return STORAGE_KEYS.NOTES;
    }
    return `mock_${this.tableName}`;
  }
}

class MockInsertBuilder<T extends keyof Database['public']['Tables']> {
  private tableName: T;
  private data: TablesInsert<T>;

  constructor(tableName: T, data: TablesInsert<T>) {
    this.tableName = tableName;
    this.data = data;
  }

  /**
   * Return the inserted data
   */
  select(): this {
    return this;
  }

  /**
   * Execute the insert
   * This makes the builder "thenable" like real Supabase queries
   */
  then<TResult1 = PostgrestResponse<Tables<T>[]>, TResult2 = never>(
    onfulfilled?: ((value: PostgrestResponse<Tables<T>[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const promise = this.executeInsert() as Promise<PostgrestResponse<Tables<T>[]>>;
    return promise.then(onfulfilled, onrejected);
  }

  /**
   * Execute the INSERT operation
   */
  private async executeInsert(): Promise<PostgrestResponse<Tables<T>[]>> {
    try {
      const storageKey = this.getStorageKey();
      const items = getFromStorage<TableRow[]>(storageKey) || [];

      // Get current session to add user_uid
      const session = getFromStorage<Session>(STORAGE_KEYS.SESSION);
      const user_uid = session?.user?.id || null;

      // Create new record with auto-generated ID
      const newRecord = {
        ...this.data,
        id: getNextId(STORAGE_KEYS.NOTE_ID_COUNTER),
        user_uid,
        created_at: this.data.created_at || new Date().toISOString(),
      };

      items.push(newRecord);
      saveToStorage(storageKey, items);

      return {
        data: [newRecord] as Tables<T>[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: '',
          hint: '',
          code: 'MOCK_ERROR',
        },
      };
    }
  }

  /**
   * Get localStorage key for the table
   */
  private getStorageKey(): string {
    if (this.tableName === 'notes') {
      return STORAGE_KEYS.NOTES;
    }
    return `mock_${this.tableName}`;
  }
}

class MockUpdateBuilder<T extends keyof Database['public']['Tables']> {
  private tableName: T;
  private data: Partial<TablesUpdate<T>>;
  private filters: Array<(item: TableRow) => boolean>;

  constructor(tableName: T, data: Partial<TablesUpdate<T>>, filters: Array<(item: TableRow) => boolean>) {
    this.tableName = tableName;
    this.data = data;
    this.filters = filters;
  }

  /**
   * Add an equality filter
   */
  eq(column: string, value: unknown): this {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  /**
   * Return the updated data
   */
  select(): this {
    return this;
  }

  /**
   * Execute the update
   * This makes the builder "thenable" like real Supabase queries
   */
  then<TResult1 = PostgrestResponse<Tables<T>[]>, TResult2 = never>(
    onfulfilled?: ((value: PostgrestResponse<Tables<T>[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const promise = this.executeUpdate() as Promise<PostgrestResponse<Tables<T>[]>>;
    return promise.then(onfulfilled, onrejected);
  }

  /**
   * Execute the UPDATE operation
   */
  private async executeUpdate(): Promise<PostgrestResponse<Tables<T>[]>> {
    try {
      const storageKey = this.getStorageKey();
      const items = getFromStorage<TableRow[]>(storageKey) || [];

      const updatedItems: TableRow[] = [];
      let updated = false;

      const newItems = items.map((item) => {
        const matches = this.filters.every((filter) => filter(item));
        if (matches) {
          updated = true;
          const updatedItem = { ...item, ...this.data };
          updatedItems.push(updatedItem);
          return updatedItem;
        }
        return item;
      });

      if (updated) {
        saveToStorage(storageKey, newItems);
      }

      return {
        data: updatedItems as Tables<T>[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: '',
          hint: '',
          code: 'MOCK_ERROR',
        },
      };
    }
  }

  /**
   * Get localStorage key for the table
   */
  private getStorageKey(): string {
    if (this.tableName === 'notes') {
      return STORAGE_KEYS.NOTES;
    }
    return `mock_${this.tableName}`;
  }
}

export default MockQueryBuilder;
