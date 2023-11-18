import { SupabaseClient } from '@supabase/supabase-js';
import {
  PostgrestFilterBuilder,
  PostgrestQueryBuilder,
  PostgrestTransformBuilder,
  PostgrestBuilder
} from '@supabase/postgrest-js';
import type { MutationMethods, QueryMeta, SupastructClient } from './types';
import { filterMethods, modifierMethods, mutationMethods } from './constants';

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

export function supastructClientFactory(
  supabaseClient: SupabaseClient
): () => SupastructClient {
  return () => createSupastructClient(supabaseClient);
}

export function createSupastructClient(
  supabaseClient: SupabaseClient
): SupastructClient {
  const queryMeta: QueryMeta = {
    from: ''
  };

  const client = supabaseClient;

  const createProxy = <T extends Record<string, any>>(target: T): T => {
    return new Proxy(target, {
      get(target, method: string, receiver) {
        if (method === 'getQueryMeta') {
          return () => queryMeta;
        }

        if (method === 'getSupabaseClient') {
          return () => client;
        }

        // intercept the query execution's response to inject `queryMeta`
        if (method === 'then') {
          // Intercept 'then' method
          return (onfulfilled: any, onrejected: any) => {
            return Reflect.get(target, method, receiver).call(
              target,
              (result: any) => {
                // Augment the result with queryMeta
                return onfulfilled({ ...result, queryMeta });
              },
              onrejected
            );
          };
        }

        return (...args: any[]) => {
          /**
           * 1. Record the Supabase.js method and arguments in queryMeta, with special handling for cases where duplicate filter methods are chained multiple times in one query
           */
          const methodArgs =
            args?.length == 1 ? args[0] : args?.length == 0 ? null : args;
          const isMutation = mutationMethods.includes(method);

          if (isMutation) {
            queryMeta.mutation = method as MutationMethods;
            if (method == 'delete') queryMeta.mutationOptions = methodArgs;
            else {
              queryMeta.values = args[0];
              queryMeta.mutationOptions =
                args && args?.length > 1 ? args[1] : {};
            }
          } else {
            const isFilter = isMutation
              ? false
              : filterMethods.includes(method);
            const isModifier = isFilter
              ? false
              : modifierMethods.includes(method);

            if (isFilter && !queryMeta.filters) queryMeta.filters = {};
            if (isModifier && !queryMeta.modifiers) queryMeta.modifiers = {};

            let meta = isFilter
              ? (queryMeta.filters as any)
              : isModifier
              ? (queryMeta.modifiers as any)
              : (queryMeta as QueryMeta);

            // @ts-ignore -- TS isn't smart enough to see that we ensure queryMeta.filters and queryMeta.modifiers aren't undefined above
            let existingMethodMeta = meta[method];

            if (!methodArgs) {
              if (method == 'select') {
                meta[method] = '*';
              } else {
                // invoked methods that don't have any args, and that don't match special cases above, will be saved to meta with value of "true", simply indicating that this method was called
                meta[method] = true;
              }
            } else if (isFilter && existingMethodMeta) {
              // handle the same filter method being used more than once:
              if (Array.isArray(existingMethodMeta)) {
                if (Array.isArray(existingMethodMeta[0])) {
                  // it's an array of arrays, meaning this method was previously called at least twice
                  meta[method] = [...existingMethodMeta, methodArgs];
                } else {
                  // it's a flat array, meaning this method was previously called once (and only once)
                  meta[method] = [existingMethodMeta, methodArgs];
                }
              } else {
                // it's a non-array value, meaning this method was previously called once with only one argument
                meta[method] = [existingMethodMeta, methodArgs];
              }
            } else {
              // 1st time setting meta for this method (in the case of a filter) -- note that if the same modifier is called more than once, the last modifier overrides previous ones:
              meta[method] = methodArgs;
            }
          }

          /**
           * 2. Call the original method
           */
          const result = Reflect.get(target, method, receiver).apply(
            target,
            args
          );

          /**
           * 3. Return a new proxy wrapper when the current method in the chain returns a class instance
           */
          if (
            result instanceof PostgrestQueryBuilder ||
            result instanceof PostgrestFilterBuilder ||
            result instanceof PostgrestTransformBuilder ||
            result instanceof PostgrestBuilder
          ) {
            return createProxy(result);
          }

          return createProxy(receiver);
        };
      }
    });
  };

  return createProxy(supabaseClient) as unknown as SupastructClient;
}
