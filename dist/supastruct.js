"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supastruct = void 0;
const constants_1 = require("./constants");
function supastruct(client, queryMeta) {
    var _a, _b, _c;
    let { mutation, values, mutationOptions, from, filters, modifiers } = queryMeta;
    try {
        if (!client)
            throw new Error("A valid Supabase client was not provided via the 1st argument.");
        //* === SET TABLE
        let query = client.from(from); // assert 'any' to make TS happy
        //* === SET MUTATION (optional; eg. update(), insert(), upsert(), delete())
        if (mutation && constants_1.mutationMethods.includes(mutation)) {
            if (mutation == "delete") {
                query = query.delete(mutationOptions);
            }
            else {
                const method = mutation; // type assertion to make TS happy
                query = (_a = query[method]) === null || _a === void 0 ? void 0 : _a.call(query, values, mutationOptions);
            }
        }
        //* === ENFORCE `SELECT` METHOD IF NOT A MUTATION AND IT'S MISSING (default "*")
        if (!mutation) {
            const selectArgs = modifiers === null || modifiers === void 0 ? void 0 : modifiers.select;
            if (selectArgs)
                query = query.select(...(Array.isArray(selectArgs) ? selectArgs : [selectArgs]));
            else
                query = query.select("*");
        }
        //* === APPEND FILTER METHODS ===
        if (filters && mutation != "insert") {
            // note: filters don't work on "insert" mutations
            (_b = Object.entries(filters)) === null || _b === void 0 ? void 0 : _b.forEach(([method, args]) => {
                var _a;
                /**
                 * The same filter method can be called multiple times in a Supabase query chain.
                 * We can detect if this is the case by checking if `args` is an array where each
                 * element is also an array -- essentially meaning that each nested array is an
                 * instance of the method (this is just how Supastruct formats the queryMeta when
                 * multiple instances of a method are called). We do this below:
                 */
                const isMultipleMethods = Array.isArray(args) && args.every(Array.isArray);
                if (isMultipleMethods) {
                    args.forEach((instanceArgs) => {
                        var _a;
                        query = (_a = query[method]) === null || _a === void 0 ? void 0 : _a.call(query, ...(Array.isArray(instanceArgs) ? instanceArgs : [instanceArgs]));
                    });
                }
                else {
                    query = (_a = query[method]) === null || _a === void 0 ? void 0 : _a.call(query, ...(Array.isArray(args) ? args : [args]));
                }
            });
        }
        //* === APPEND MODIFIER METHODS ===
        if (modifiers) {
            (_c = Object.entries(modifiers)) === null || _c === void 0 ? void 0 : _c.forEach(([method, args]) => {
                var _a, _b;
                /**
                 * Note: unlike filter methods, the same modifier can't be used more than once,
                 * so we don't have to worry about handling that like we do with filters above.
                 */
                if (args === true)
                    query = (_a = query[method]) === null || _a === void 0 ? void 0 : _a.call(query);
                // when args == true, it means the method should be called but without any args
                else
                    query = (_b = query[method]) === null || _b === void 0 ? void 0 : _b.call(query, ...(Array.isArray(args) ? args : [args]));
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
    }
    catch (err) {
        throw Error(`Supastruct error: ${err.message}`);
    }
}
exports.supastruct = supastruct;
