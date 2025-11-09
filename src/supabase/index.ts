// Mock Supabase client using localStorage
import MockSupabaseClient from './mockClient';

const supabase = new MockSupabaseClient();

export default supabase;
export const supabaseRedirectUrl = window.location.origin;
