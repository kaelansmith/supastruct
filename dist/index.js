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
exports.mutationMethods = exports.modifierMethods = exports.filterMethods = exports.getMetaFromQuery = exports.createSupabaseProxyClient = exports.SupastructClient = exports.supastruct = void 0;
__exportStar(require("./types"), exports);
var supastruct_1 = require("./supastruct");
Object.defineProperty(exports, "supastruct", { enumerable: true, get: function () { return supastruct_1.supastruct; } });
var SupastructClient_1 = require("./SupastructClient");
Object.defineProperty(exports, "SupastructClient", { enumerable: true, get: function () { return SupastructClient_1.SupastructClient; } });
var createSupabaseProxyClient_1 = require("./createSupabaseProxyClient");
Object.defineProperty(exports, "createSupabaseProxyClient", { enumerable: true, get: function () { return createSupabaseProxyClient_1.createSupabaseProxyClient; } });
var helpers_1 = require("./helpers");
Object.defineProperty(exports, "getMetaFromQuery", { enumerable: true, get: function () { return helpers_1.getMetaFromQuery; } });
var constants_1 = require("./constants");
Object.defineProperty(exports, "filterMethods", { enumerable: true, get: function () { return constants_1.filterMethods; } });
Object.defineProperty(exports, "modifierMethods", { enumerable: true, get: function () { return constants_1.modifierMethods; } });
Object.defineProperty(exports, "mutationMethods", { enumerable: true, get: function () { return constants_1.mutationMethods; } });
