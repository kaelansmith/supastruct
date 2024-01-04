"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupabaseProxyClient = void 0;
const postgrest_js_1 = require("@supabase/postgrest-js");
const constants_1 = require("./constants");
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
function createSupabaseProxyClient(supabaseClient, _hooks) {
    let queryMeta = {
        from: "",
    };
    const hooks = _hooks;
    const client = supabaseClient;
    let proxyClient;
    const createProxy = (target) => {
        return new Proxy(target, {
            get(target, method, receiver) {
                var _a;
                if (method === "getQueryMeta") {
                    return () => queryMeta;
                }
                if (method === "addQueryMeta") {
                    return (...args) => {
                        const partialQueryMeta = args[0];
                        queryMeta = Object.assign(Object.assign({}, queryMeta), partialQueryMeta);
                    };
                }
                if (method === "getSupabaseClient") {
                    return () => client;
                }
                if (method === "getProxyClient") {
                    return () => proxyClient;
                }
                // intercept the query execution's response to inject `queryMeta` and run user-defined action hooks
                if (method === "then") {
                    const { beforeExecution, onError, onSuccess, onSettled } = (_a = hooks === null || hooks === void 0 ? void 0 : hooks.actions[queryMeta.mutation ? "mutations" : "queries"]) !== null && _a !== void 0 ? _a : {};
                    const beforeExecutionResult = beforeExecution === null || beforeExecution === void 0 ? void 0 : beforeExecution({ queryMeta });
                    // Intercept 'then' method
                    return (onfulfilled, onrejected) => {
                        return Reflect.get(target, method, receiver).call(target, (result) => {
                            // Augment the result with queryMeta
                            const queryResponse = Object.assign(Object.assign({}, result), { queryMeta });
                            // run user-defined action hooks, if any exist for this query type
                            // const action = {
                            //   update: onUpdate, // TODO: perhaps use supastruct to retrieve doc before we run update mutation, so we can include its original data along with its updated data in this hook, so we can know which fields changed
                            //   insert: onInsert,
                            //   upsert: onUpsert,
                            //   delete: onDelete,
                            // }[queryMeta.mutation];
                            // const actionHookArgs = {
                            //   data: queryResponse.data,
                            //   error: queryResponse.error,
                            //   queryMeta,
                            // };
                            const context = {
                                beforeExecutionResult,
                            };
                            if (queryResponse.error)
                                onError === null || onError === void 0 ? void 0 : onError({ error: queryResponse.error, queryMeta, context });
                            else
                                onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess({ data: queryResponse.data, queryMeta, context });
                            onSettled === null || onSettled === void 0 ? void 0 : onSettled({
                                data: queryResponse.data,
                                error: queryResponse.error,
                                queryMeta,
                                context,
                            });
                            // if (action) action(actionHookArgs);
                            // if (onMutate) onMutate(actionHookArgs)
                            return onfulfilled(queryResponse);
                        }, onrejected);
                    };
                }
                // handle all other methods:
                return (...args) => {
                    var _a, _b, _c, _d;
                    /**
                     * 1. Record the Supabase.js method and arguments in queryMeta, with special handling for cases where duplicate filter methods are chained multiple times in one query
                     */
                    let filteredArgs; // will get set by user-defined hooks, if any exist
                    const methodArgs = (args === null || args === void 0 ? void 0 : args.length) == 1 ? args[0] : (args === null || args === void 0 ? void 0 : args.length) == 0 ? null : args;
                    const isMutation = constants_1.mutationMethods.includes(method);
                    if (isMutation) {
                        queryMeta.mutation = method;
                        if (method == "delete")
                            queryMeta.mutationOptions = methodArgs;
                        else {
                            // 1. set QueryMeta
                            const records = args[0];
                            queryMeta.values = records;
                            queryMeta.mutationOptions =
                                args && (args === null || args === void 0 ? void 0 : args.length) > 1 ? args[1] : {};
                            // 2. apply filter hooks on records to mutate, if any were provided
                            const filter = {
                                update: (_a = hooks === null || hooks === void 0 ? void 0 : hooks.filters) === null || _a === void 0 ? void 0 : _a.recordForUpdate,
                                insert: (_b = hooks === null || hooks === void 0 ? void 0 : hooks.filters) === null || _b === void 0 ? void 0 : _b.recordsForInsert,
                                upsert: (_c = hooks === null || hooks === void 0 ? void 0 : hooks.filters) === null || _c === void 0 ? void 0 : _c.recordsForUpsert,
                            }[method];
                            if (filter) {
                                const filteredRecords = filter(records);
                                filteredArgs = [filteredRecords, queryMeta.mutationOptions];
                            }
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
                    const result = (_d = Reflect.get(target, method, receiver)) === null || _d === void 0 ? void 0 : _d.apply(target, filteredArgs !== null && filteredArgs !== void 0 ? filteredArgs : args);
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
    proxyClient = createProxy(supabaseClient);
    return proxyClient;
}
exports.createSupabaseProxyClient = createSupabaseProxyClient;
