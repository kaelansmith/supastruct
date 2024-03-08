import { SupabaseClient } from "@supabase/supabase-js";
import { QueryMeta, SupastructResult } from "./types";
import { mutationMethods } from "./constants";

export function supastruct(
  client: SupabaseClient,
  queryMeta: QueryMeta
): SupastructResult {
  let { mutation, values, mutationOptions, from, filters, modifiers } =
    queryMeta;

  try {
    if (!client)
      throw new Error(
        "A valid Supabase client was not provided via the 1st argument."
      );

    //* === SET TABLE
    let query: any = client.from(from); // assert 'any' to make TS happy

    //* === SET MUTATION (optional; eg. update(), insert(), upsert(), delete())
    if (mutation && mutationMethods.includes(mutation)) {
      if (mutation == "delete") {
        query = query.delete(mutationOptions);
      } else {
        const method = mutation as "update" | "insert" | "upsert"; // type assertion to make TS happy
        query = query[method]?.(values, mutationOptions);
      }
    }

    //* === ENFORCE `SELECT` METHOD IF NOT A MUTATION AND IT'S MISSING (default "*")
    if (!mutation) {
      const selectArgs = modifiers?.select;
      if (selectArgs)
        query = query.select(
          ...(Array.isArray(selectArgs) ? selectArgs : [selectArgs])
        );
      else query = query.select("*");
    }

    //* === APPEND FILTER METHODS ===
    if (filters && mutation != "insert") {
      // note: filters don't work on "insert" mutations
      Object.entries(filters)?.forEach(([method, args]) => {
        /**
         * The same filter method can be called multiple times in a Supabase query chain.
         * We can detect if this is the case by checking if `args` is an array where each
         * element is also an array -- essentially meaning that each nested array is an
         * instance of the method (this is just how Supastruct formats the queryMeta when
         * multiple instances of a method are called). We do this below:
         */
        const isMultipleMethods =
          Array.isArray(args) && args.every(Array.isArray);
        if (isMultipleMethods) {
          args.forEach((instanceArgs) => {
            query = query[method]?.(
              ...(Array.isArray(instanceArgs) ? instanceArgs : [instanceArgs])
            );
          });
        } else {
          query = query[method]?.(...(Array.isArray(args) ? args : [args]));
        }
      });
    }

    //* === APPEND MODIFIER METHODS ===
    if (modifiers) {
      Object.entries(modifiers)?.forEach(([method, args]) => {
        /**
         * Note: unlike filter methods, the same modifier can't be used more than once,
         * so we don't have to worry about handling that like we do with filters above.
         */
        if (args === true) query = query[method]?.();
        // when args == true, it means the method should be called but without any args
        else query = query[method]?.(...(Array.isArray(args) ? args : [args]));
      });
    }

    /**
     ** === FINALLY, RETURN QUERY ===
     * Note: we don't execute the query here -- the user can choose to execute it automatically by
     * doing `await supastruct(...)`.. by not using `await` they can receive the query builder and
     * continue chaining methods before running the query with `await` later on -- for example:
     *
     *  const query = supastruct(...);
     *  const { data, error } = await query.csv(); // sets return format for `data` to CSV string before executing the query via `await`
     */
    return query;
  } catch (err: any) {
    throw Error(`Supastruct error: ${err.message}`);
  }
}
