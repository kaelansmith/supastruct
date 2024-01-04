import { SupabaseClient } from "@supabase/supabase-js";
import {
  PostgrestBuilder,
  PostgrestTransformBuilder,
  PostgrestFilterBuilder,
  PostgrestQueryBuilder,
  PostgrestResponseSuccess,
  PostgrestResponseFailure,
} from "@supabase/postgrest-js";

export type FilterHookCallback<TValue = any, TArgs = undefined> = (
  valueToFilter: TValue,
  args?: TArgs
) => TValue;

export type ActionHookDefaultArgs = {
  /** The full record data returned by Supabase after the DB mutation finishes */
  data: SupabaseRecord | SupabaseRecord[] | null;
  /** Error returned/caught by Supabase during DB mutation */
  error: any;
  /** The queryMeta representing the DB mutation that occured */
  queryMeta: QueryMeta;
  context: {
    beforeExecutionResult: {
      previousData?: SupabaseRecord | SupabaseRecord[];
      [key: string]: any;
    };
    [key: string]: any;
  };
};

export type ActionHookCallback<
  TArgs = ActionHookDefaultArgs,
  TResult = void
> = (args: TArgs) => TResult;

export type SupabaseClientHooks = {
  filters?: SupabaseClientFilterHooks;
  actions?: SupabaseClientActionHooks;
};

export type SupabaseClientFilterHooks = {
  // transform records before mutations occur,
  recordsForInsert?: FilterHookCallback<SupabaseRecord[]>;
  recordsForUpsert?: FilterHookCallback<SupabaseRecord[]>;
  recordForUpdate?: FilterHookCallback<SupabaseRecord>;
  // TODO:
  // queryResponse?: FilterHookCallback<
  //   PostgrestResponseSuccess<SupabaseRecord>
  // >;
};

export type QueryLifecycleHooks = {
  beforeExecution?: ActionHookCallback<
    Pick<ActionHookDefaultArgs, "queryMeta">,
    any
  >;
  onError?: ActionHookCallback<
    Pick<ActionHookDefaultArgs, "error" | "queryMeta" | "context">
  >;
  onSuccess?: ActionHookCallback<
    Pick<ActionHookDefaultArgs, "data" | "queryMeta" | "context">
  >;
  onSettled?: ActionHookCallback;
};

export type SupabaseClientActionHooks = {
  // run side-effects after mutations occur
  mutations?: QueryLifecycleHooks;
  queries?: QueryLifecycleHooks;
  // onMutate?: ActionHookCallback;
  // onInsert?: ActionHookCallback;
  // onUpdate?: ActionHookCallback;
  // onUpsert?: ActionHookCallback;
  // onDelete?: ActionHookCallback;
};

/**
 ** === Supastruct-ify Supabase.js Types ==========================
 */

export interface SupastructExtension {
  getQueryMeta: () => QueryMeta;
  getSupabaseClient: () => SupabaseClient;
  getProxyClient: () => SupabaseProxyClient;
  addQueryMeta: (queryMeta: Partial<QueryMeta>) => void;
}
export type Supastructify<T> = T & SupastructExtension;

export type SupabaseProxyClient = Supastructify<SupabaseClient>;
export type SupastructBaseBuilder = Supastructify<PostgrestBuilder<any>>;
export type SupastructTransformBuilder = Supastructify<
  PostgrestTransformBuilder<any, any, any>
>;
export type SupastructQueryBuilder = Supastructify<
  PostgrestQueryBuilder<any, any>
>;
export type SupastructFilterBuilder = Supastructify<
  PostgrestFilterBuilder<any, any, any>
>;

export interface SupastructResultExtension {
  queryMeta: QueryMeta;
}

export type SupastructResult<TData = any> =
  | (PostgrestResponseSuccess<TData> & SupastructResultExtension)
  | (PostgrestResponseFailure & SupastructResultExtension);

/**
 ** === QueryMeta ==========================
 */
export type QueryMeta =
  | BaseQueryMeta
  | UpdateQueryMeta
  | InsertQueryMeta
  | UpsertQueryMeta
  | DeleteQueryMeta;

export type MutationCountOption = {
  count?: "exact" | "planned" | "estimated";
};

export type CustomMutationVariables = {
  mutation: PostgrestFilterBuilder<any, any, any>;
  // mutation: SupastructFilterBuilder;
};

export type UpdateQueryMeta = BaseQueryMeta & UpdateVariables;
export type UpdateVariables = {
  mutation: "update";
  values?: SupabaseRecord;
  mutationOptions?: MutationCountOption;
};

export type InsertQueryMeta = BaseQueryMeta & InsertVariables;
export type InsertMutationOptions = MutationCountOption & {
  defaultToNull?: boolean;
};
export type InsertVariables = {
  mutation: "insert";
  values?: SupabaseRecord | SupabaseRecord[];
  mutationOptions?: InsertMutationOptions;
};

export type UpsertQueryMeta = BaseQueryMeta & UpsertVariables;
export type UpsertMutationOptions = MutationCountOption & {
  onConflict?: string;
  ignoreDuplicates?: boolean;
  defaultToNull?: boolean;
};
export type UpsertVariables = {
  mutation: "upsert";
  values?: SupabaseRecord | SupabaseRecord[];
  mutationOptions?: UpsertMutationOptions;
};

export type DeleteQueryMeta = BaseQueryMeta & DeleteVariables;
export type DeleteVariables = {
  mutation: "delete";
  // values?: never;
  mutationOptions?: MutationCountOption;
};

export type BaseQueryMeta = {
  from: string;
  values?: SupabaseRecord | SupabaseRecord[];
  filters?: {
    eq?: FiltersMeta;
    neq?: FiltersMeta;
    gt?: FiltersMeta;
    gte?: FiltersMeta;
    lt?: FiltersMeta;
    lte?: FiltersMeta;
    like?: PatternFiltersMeta;
    ilike?: PatternFiltersMeta;
    likeAllOf?: PatternsFiltersMeta;
    likeAnyOf?: PatternsFiltersMeta;
    ilikeAllOf?: PatternsFiltersMeta;
    ilikeAnyOf?: PatternsFiltersMeta;
    is?: FiltersMeta<boolean | null>;
    in?: FiltersMeta<unknown[]>;
    not?: OperatorFiltersMeta;
    or?: OrFiltersMeta;
    and?: AndFiltersMeta;
    contains?: ContainsFilterMeta;
    containedBy?: ContainsFilterMeta;
    rangeGt?: RangeFiltersMeta;
    rangeGte?: RangeFiltersMeta;
    rangeLt?: RangeFiltersMeta;
    rangeLte?: RangeFiltersMeta;
    rangeAdjacent?: RangeFiltersMeta;
    overlaps?: FiltersMeta<string | unknown[]>;
    filter?: OperatorFiltersMeta;
    match?: MatchFiltersMeta;
    textSearch?: TextSearchFiltersMeta;
    [key: string]: any;
  };
  modifiers?: {
    select?:
      | string
      | [
          columns: string,
          options?: { head: boolean; count: "exact" | "planned" | "estimated" }
        ];
    order?:
      | string
      | [
          column: string,
          options?: {
            ascending?: boolean;
            nullsFirst?: boolean;
            foreignTable?: undefined | string;
            referencedTable?: undefined | string;
          }
        ];
    limit?:
      | number
      | [
          count: number,
          options?: { foreignTable?: string; referencedTable?: string }
        ];
    range?: [
      from: number,
      to: number,
      options?: { foreignTable?: string; referencedTable?: string }
    ];
    abortSignal?: AbortSignal;
    single?: true;
    maybeSingle?: true;
    csv?: true;
    geojson?: true;
    explain?: {
      analyze?: boolean;
      verbose?: boolean;
      settings?: boolean;
      buffers?: boolean;
      wal?: boolean;
      format?: "json" | "text";
    };
    rollback?: true;
    returns?: true;
    [key: string]: any;
  };
  [key: string]: any;
};

export type SingleFilterMeta<TValue = unknown> = [
  column: string,
  value: TValue
];
export type FiltersMeta<TValue = unknown> =
  | SingleFilterMeta<TValue>
  | SingleFilterMeta<TValue>[];

export type SingleRangeFilterMeta = [column: string, range: string];
export type RangeFiltersMeta = SingleRangeFilterMeta | SingleRangeFilterMeta[];

export type SingleTextSearchFilterMeta = [
  column: string,
  query: string,
  options?: { config?: string; type?: "plain" | "phrase" | "websearch" }
];
export type TextSearchFiltersMeta =
  | SingleTextSearchFilterMeta
  | SingleTextSearchFilterMeta[];

export type SingleMatchFilterMeta = Record<string, unknown>;
export type MatchFiltersMeta = SingleMatchFilterMeta | SingleMatchFilterMeta[];

export type SingleOrFilterMeta =
  | string
  | [
      filters: string,
      options?: { foreignTable?: string; referencedTable?: string }
    ];
export type OrFiltersMeta = SingleOrFilterMeta | SingleOrFilterMeta[];

export type SingleAndFilterMeta = string[];
export type AndFiltersMeta = SingleAndFilterMeta | SingleAndFilterMeta[];

export type SinglePatternFilterMeta = [column: string, pattern: string];
export type PatternFiltersMeta =
  | SinglePatternFilterMeta
  | SinglePatternFilterMeta[];

export type SingleMultiPatternFilterMeta = [column: string, patterns: string[]];
export type PatternsFiltersMeta =
  | SingleMultiPatternFilterMeta
  | SingleMultiPatternFilterMeta[];

export type FilterWithOperator = [
  column: string,
  operator: string,
  value: unknown
];
export type OperatorFiltersMeta = FilterWithOperator | FilterWithOperator[];

export type ContainsFilterMeta = FiltersMeta<
  string | unknown[] | Record<string, unknown>
>;

export type SupabaseRecord = Record<string, any>;
export type RecordID = string | number;

// export type DBOperations = 'update' | 'insert' | 'upsert' | 'delete' | 'select';
export type MutationMethods = "update" | "insert" | "upsert" | "delete";
