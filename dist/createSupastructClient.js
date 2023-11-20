"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupastructClient = exports.supastructClientFactory = void 0;
const postgrest_js_1 = require("@supabase/postgrest-js");
const constants_1 = require("./constants");
/**
 * createSupastructClient() wraps a regular Supabase.js client with a Proxy, and
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
 * implemented this example as a separate package called `@supastruct/react-query`.
 */
function supastructClientFactory(supabaseClient) {
    return () => createSupastructClient(supabaseClient);
}
exports.supastructClientFactory = supastructClientFactory;
/**
 * TODO: think about how to implement hook system for Supabase-js client.
 * For example, user can pass an object to createSupastructClient with callback methods:
 * `onUpdate`, `onInsert`, `onUpsert`, `onSelect`, `onDelete` (and maybe `onError`,
 * `onSuccess`, `onSettled`?).. these methods would be called within the `then` method
 * (i.e. post-query execution), using the queryMeta to determine which ones to call, and
 * passing the queryMeta into the callbacks... so user can do things like "on update of
 * `todos`, if the update data includes `fieldX` with value `Y`, perform some side-effect
 * such as creating records in another table."
 */
function createSupastructClient(supabaseClient) {
    const queryMeta = {
        from: "",
    };
    const client = supabaseClient;
    const createProxy = (target) => {
        return new Proxy(target, {
            get(target, method, receiver) {
                if (method === "getQueryMeta") {
                    return () => queryMeta;
                }
                if (method === "getSupabaseClient") {
                    return () => client;
                }
                // intercept the query execution's response to inject `queryMeta`
                if (method === "then") {
                    // Intercept 'then' method
                    return (onfulfilled, onrejected) => {
                        return Reflect.get(target, method, receiver).call(target, (result) => {
                            // Augment the result with queryMeta
                            return onfulfilled(Object.assign(Object.assign({}, result), { queryMeta }));
                        }, onrejected);
                    };
                }
                return (...args) => {
                    /**
                     * 1. Record the Supabase.js method and arguments in queryMeta, with special handling for cases where duplicate filter methods are chained multiple times in one query
                     */
                    const methodArgs = (args === null || args === void 0 ? void 0 : args.length) == 1 ? args[0] : (args === null || args === void 0 ? void 0 : args.length) == 0 ? null : args;
                    const isMutation = constants_1.mutationMethods.includes(method);
                    if (isMutation) {
                        queryMeta.mutation = method;
                        if (method == "delete")
                            queryMeta.mutationOptions = methodArgs;
                        else {
                            queryMeta.values = args[0];
                            queryMeta.mutationOptions =
                                args && (args === null || args === void 0 ? void 0 : args.length) > 1 ? args[1] : {};
                        }
                    }
                    else {
                        const isFilter = isMutation
                            ? false
                            : constants_1.filterMethods.includes(method);
                        const isModifier = isFilter
                            ? false
                            : constants_1.modifierMethods.includes(method);
                        if (isFilter && !queryMeta.filters)
                            queryMeta.filters = {};
                        if (isModifier && !queryMeta.modifiers)
                            queryMeta.modifiers = {};
                        let meta = isFilter
                            ? queryMeta.filters
                            : isModifier
                                ? queryMeta.modifiers
                                : queryMeta;
                        let existingMethodMeta = meta[method];
                        if (!methodArgs) {
                            if (method == "select") {
                                meta[method] = "*";
                            }
                            else {
                                // invoked methods that don't have any args, and that don't match special cases above, will be saved to meta with value of "true", simply indicating that this method was called
                                meta[method] = true;
                            }
                        }
                        else if (isFilter && existingMethodMeta) {
                            // handle the same filter method being used more than once:
                            if (Array.isArray(existingMethodMeta)) {
                                if (Array.isArray(existingMethodMeta[0])) {
                                    // it's an array of arrays, meaning this method was previously called at least twice
                                    meta[method] = [...existingMethodMeta, methodArgs];
                                }
                                else {
                                    // it's a flat array, meaning this method was previously called once (and only once)
                                    meta[method] = [existingMethodMeta, methodArgs];
                                }
                            }
                            else {
                                // it's a non-array value, meaning this method was previously called once with only one argument
                                meta[method] = [existingMethodMeta, methodArgs];
                            }
                        }
                        else {
                            // 1st time setting meta for this method (in the case of a filter) -- note that if the same modifier is called more than once, the last modifier overrides previous ones:
                            meta[method] = methodArgs;
                        }
                    }
                    /**
                     * 2. Call the original method
                     */
                    const result = Reflect.get(target, method, receiver).apply(target, args);
                    /**
                     * 3. Return a new proxy wrapper when the current method in the chain returns a class instance
                     */
                    if (result instanceof postgrest_js_1.PostgrestQueryBuilder ||
                        result instanceof postgrest_js_1.PostgrestFilterBuilder ||
                        result instanceof postgrest_js_1.PostgrestTransformBuilder ||
                        result instanceof postgrest_js_1.PostgrestBuilder) {
                        return createProxy(result);
                    }
                    return createProxy(receiver);
                };
            },
        });
    };
    return createProxy(supabaseClient);
}
exports.createSupastructClient = createSupastructClient;
