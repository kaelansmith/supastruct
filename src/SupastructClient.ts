import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseProxyClient } from "./createSupabaseProxyClient";
import type {
  SupabaseClientHooks,
  SupabaseProxyClient,
  SupastructQueryBuilder,
} from "./types";

export class SupastructClient {
  protected client: SupabaseClient;
  protected hooks: SupabaseClientHooks;
  // protected proxyClient: SupabaseProxyClient;

  constructor(supabaseClient: SupabaseClient) {
    this.client = supabaseClient;
  }

  setHooks(hooks?: SupabaseClientHooks): this {
    this.hooks = hooks;
    return this;
  }

  /**
   * Calling ".from()" on a SupastructClient instance will automatically create a new SupabaseProxy client, which
   * ensures queryMeta state (and any other query-specific state) is scoped/tied to each specific query. The API is
   * exactly the same as a regular Supabase client.
   */
  from(table: string): SupastructQueryBuilder {
    const proxyClient = createSupabaseProxyClient(this.client, this.hooks);
    // this.proxyClient = proxyClient;
    return proxyClient.from(table) as SupastructQueryBuilder;
  }

  /** Retrieve the original, unmodified Supabase client */
  // protected getProxyClient(): SupabaseClient {
  //   return this.proxyClient;
  // }

  /** Retrieve the original, unmodified Supabase client */
  protected getSupabaseClient(): SupabaseClient {
    return this.client;
  }
}
