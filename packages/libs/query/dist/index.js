"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  QueryClient: () => import_react_query2.QueryClient,
  QueryClientProvider: () => import_react_query2.QueryClientProvider,
  createQueryClient: () => createQueryClient,
  getQueryClient: () => getQueryClient,
  useInfiniteQuery: () => import_react_query2.useInfiniteQuery,
  useMutation: () => import_react_query2.useMutation,
  useQuery: () => import_react_query2.useQuery,
  useQueryClient: () => import_react_query2.useQueryClient
});
module.exports = __toCommonJS(index_exports);
var import_react_query = require("@tanstack/react-query");
var import_react_query2 = require("@tanstack/react-query");
var queryClient;
function getQueryClient() {
  if (!queryClient) {
    throw new Error("Query client is not created yet.");
  }
  return queryClient;
}
function createQueryClient() {
  if (queryClient) {
    throw new Error("Query client is already created.");
  }
  queryClient = new import_react_query.QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
      }
    }
  });
  return queryClient;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  QueryClient,
  QueryClientProvider,
  createQueryClient,
  getQueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
});
//# sourceMappingURL=index.js.map