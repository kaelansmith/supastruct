import { SupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClientHooks, SupabaseProxyClient } from "./types";
/**
 * createSupabaseProxyClient() wraps a regular Supabase.js client with a Proxy, and
 * intercepts its method calls so it can save information about the query being
 * generated before letting the original methods do their thing. It also adds a
 * new client method `getQueryMeta` that returns the object representation
 * of the query, which you should call after chaining all your supabase
 * query/filter/modifier methods but before executing the query with `await` --
 * or simply access the new `queryMeta` property from the query response
 * object after it has executed; this allows you to more easily run conditional
 * side-effects post-query, and just generally makes supabase-js more extendable
 * by other libraries/packages.
 *
 * For example, you could write an abstraction function that receives a Supabase.js query
 * and uses its `getQueryMeta` method to auto-generate a unique key to store that query's data
 * under in your local cache, using a tool like React Query. Similarly, you could write an
 * abstraction function that receives a Supabase.js mutation and uses its returned `queryMeta`
 * to optimisticly update your cache with the new data, resulting in a snappy UI/UX. In fact, I
 * implemented this example as a separate package called `@kaelan/supaquery`.
 */
/**
 * TODO: think about how to implement hook system for Supabase-js client.
 * For example, user can pass an object to createSupabaseProxyClient with callback methods:
 * `onUpdate`, `onInsert`, `onUpsert`, `onSelect`, `onDelete` (and maybe `onError`,
 * `onSuccess`, `onSettled`?).. these methods would be called within the `then` method
 * (i.e. post-query execution), using the queryMeta to determine which ones to call, and
 * passing the queryMeta into the callbacks... so user can do things like "on update of
 * `todos`, if the update data includes `fieldX` with value `Y`, perform some side-effect
 * such as creating records in another table."
 */
export declare function createSupabaseProxyClient(supabaseClient: SupabaseClient, _hooks?: SupabaseClientHooks): SupabaseProxyClient;
