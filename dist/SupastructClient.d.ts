import { SupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClientHooks, SupastructQueryBuilder } from "./types";
export declare class SupastructClient {
    protected client: SupabaseClient;
    protected hooks: SupabaseClientHooks;
    constructor(supabaseClient: SupabaseClient);
    setHooks(hooks?: SupabaseClientHooks): this;
    /**
     * Calling ".from()" on a SupastructClient instance will automatically create a new SupabaseProxy client, which
     * ensures queryMeta state (and any other query-specific state) is scoped/tied to each specific query. The API is
     * exactly the same as a regular Supabase client.
     */
    from(table: string): SupastructQueryBuilder;
    /** Retrieve the original, unmodified Supabase client */
    protected getSupabaseClient(): SupabaseClient;
}
