export const filterMethods = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'like',
  'ilike',
  'likeAllOf',
  'likeAnyOf',
  'ilikeAllOf',
  'ilikeAnyOf',
  'is',
  'in',
  'not',
  'or',
  'and',
  'contains',
  'containedBy',
  'rangeGt',
  'rangeGte',
  'rangeLt',
  'rangeLte',
  'rangeAdjacent',
  'overlaps',
  'filter',
  'match',
  'textSearch'
];

export const modifierMethods = [
  'select',
  'order',
  'limit',
  'range',
  'abortSignal',
  'single',
  'maybeSingle',
  'csv',
  'geojson',
  'explain',
  'rollback',
  'returns'
];

export const mutationMethods = ['update', 'insert', 'upsert', 'delete'];
