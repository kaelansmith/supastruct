"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutationMethods = exports.modifierMethods = exports.filterMethods = exports.createSupastructClient = exports.supastructClientFactory = exports.getMetaFromQuery = exports.supastruct = void 0;
__exportStar(require("./types"), exports);
var supastruct_1 = require("./supastruct");
Object.defineProperty(exports, "supastruct", { enumerable: true, get: function () { return supastruct_1.supastruct; } });
var helpers_1 = require("./helpers");
Object.defineProperty(exports, "getMetaFromQuery", { enumerable: true, get: function () { return helpers_1.getMetaFromQuery; } });
var createSupastructClient_1 = require("./createSupastructClient");
Object.defineProperty(exports, "supastructClientFactory", { enumerable: true, get: function () { return createSupastructClient_1.supastructClientFactory; } });
Object.defineProperty(exports, "createSupastructClient", { enumerable: true, get: function () { return createSupastructClient_1.createSupastructClient; } });
var constants_1 = require("./constants");
Object.defineProperty(exports, "filterMethods", { enumerable: true, get: function () { return constants_1.filterMethods; } });
Object.defineProperty(exports, "modifierMethods", { enumerable: true, get: function () { return constants_1.modifierMethods; } });
Object.defineProperty(exports, "mutationMethods", { enumerable: true, get: function () { return constants_1.mutationMethods; } });
