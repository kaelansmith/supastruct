"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupastructClient = void 0;
const createSupabaseProxyClient_1 = require("./createSupabaseProxyClient");
class SupastructClient {
    constructor(supabaseClient) {
        this.client = supabaseClient;
    }
    setHooks(hooks) {
        this.hooks = hooks;
        return this;
    }
    /**
     * Calling ".from()" on a SupastructClient instance will automatically create a new SupabaseProxy client, which
     * ensures queryMeta state (and any other query-specific state) is scoped/tied to each specific query. The API is
     * exactly the same as a regular Supabase client.
     */
    from(table) {
        const proxyClient = (0, createSupabaseProxyClient_1.createSupabaseProxyClient)(this.client, this.hooks);
        return proxyClient.from(table);
    }
    /** Retrieve the original, unmodified Supabase client */
    getSupabaseClient() {
        return this.client;
    }
}
exports.SupastructClient = SupastructClient;
