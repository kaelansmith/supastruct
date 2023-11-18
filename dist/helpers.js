"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetaFromQuery = void 0;
const getMetaFromQuery = (query) => {
    // @ts-ignore -- ignore TS until we solve `getQueryMeta` TS issue
    if (!query.getQueryMeta)
        throw Error(`You didn't provide a query using the Supastruct client (an altered version of the default Supabase client).`);
    const queryMeta = query.getQueryMeta();
    return queryMeta;
};
exports.getMetaFromQuery = getMetaFromQuery;
