import { SupabaseClient } from '@supabase/supabase-js';
import { QueryMeta, SupastructResult } from './types';
export declare function supastruct(client: SupabaseClient, queryMeta: QueryMeta): SupastructResult;
