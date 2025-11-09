# Mock Supabase Implementation

This project now uses a localStorage-based mock implementation instead of the real Supabase client.

## Relevant Files

1. `src/supabase/localStorage.ts` - Helper functions for localStorage operations
2. `src/supabase/mockAuth.ts` - Mock authentication system that mimics Supabase Auth API
3. `src/supabase/mockQueryBuilder.ts` - Mock database query builder with Supabase-like API
4. `src/supabase/mockClient.ts` - Main mock client that combines auth and database operations
5. `src/supabase/index.ts` - Now exports mock client instead of real Supabase client
6. `src/supabase/useSession.tsx` - Fixed typo in variable name (`isFetchingSession`)
7. `src/AuthenticatedRoute/index.tsx` - Replaced Supabase Auth UI with custom email/password form

## Features

### Authentication

- **Anonymous sign-in**: Click "Use without signing in" to create a guest user.
- **Email/Password**: Simple sign up and sign in functionality
- **Sign out**: Works through the Header component
- **Session persistence**: Sessions are stored in localStorage

### Data Storage

- All notes are stored in localStorage under the key `mock_notes`
- Each user's notes are associated with their `user_uid`
- Auto-incrementing IDs for notes and users
- Session data persists across page refreshes

### API Compatibility

The mock client provides the same API as Supabase:

```typescript
// These work exactly the same as before:
supabase.auth.signInAnonymously()
supabase.auth.signInWithPassword({ email, password })
supabase.auth.signUp({ email, password })
supabase.auth.signOut()
supabase.auth.getSession()
supabase.auth.getUser()
supabase.auth.onAuthStateChange(callback)

supabase.from('notes').select()
supabase.from('notes').insert({ date, content })
supabase.from('notes').update({ content }).eq('id', noteId)
supabase.from('notes').select().eq('date', date)
supabase.from('notes').select().gte('date', startDate).lt('date', endDate)
```

## localStorage Keys

- `mock_session` - Current user session
- `mock_notes` - Array of all notes
- `mock_note_id_counter` - Auto-increment counter for note IDs
- `mock_user_id_counter` - Auto-increment counter for user IDs

## Switching to Real Supabase

To switch to the real Supabase client, updated `src/supabase/index.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default supabase;
export const supabaseRedirectUrl = import.meta.env.VITE_SUPABASE_REDIRECT_URL;
```

And restore the original `src/AuthenticatedRoute/index.tsx` with the Supabase Auth UI component.
