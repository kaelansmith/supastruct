"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutationMethods = exports.modifierMethods = exports.filterMethods = void 0;
exports.filterMethods = [
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
exports.modifierMethods = [
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
exports.mutationMethods = ['update', 'insert', 'upsert', 'delete'];
