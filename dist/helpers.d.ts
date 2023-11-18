import { QueryMeta } from './types';
import { PostgrestQueryBuilder, PostgrestFilterBuilder, PostgrestBuilder } from '@supabase/postgrest-js';
export declare const getMetaFromQuery: (query: PostgrestQueryBuilder<any, any> | PostgrestFilterBuilder<any, any, any> | PostgrestBuilder<any>) => QueryMeta;
