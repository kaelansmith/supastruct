import { QueryMeta, SupastructFilterBuilder } from "./types";
import {
  PostgrestQueryBuilder,
  PostgrestFilterBuilder,
  PostgrestBuilder,
} from "@supabase/postgrest-js";

export const getMetaFromQuery = (
  query:
    | PostgrestQueryBuilder<any, any>
    | PostgrestFilterBuilder<any, any, any>
    | PostgrestBuilder<any>
): QueryMeta => {
  // @ts-ignore -- ignore TS until we solve `getQueryMeta` TS issue
  if (!query.getQueryMeta)
    throw Error(
      `You didn't provide a query using the Supastruct client (an altered version of the default Supabase client).`
    );

  const queryMeta = (query as SupastructFilterBuilder).getQueryMeta();

  return queryMeta;
};
