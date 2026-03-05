'use strict';
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __export = (target, all) => {
	for (const name in all) {
		__defProp(target, name, { get: all[name], enumerable: true });
	}
};
const __copyProps = (to, from, except, desc) => {
	if ((from && typeof from === 'object') || typeof from === 'function') {
		for (const key of __getOwnPropNames(from)) {
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: () => from[key],
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
				});
			}
		}
	}
	return to;
};
const __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// src/index.ts
const index_exports = {};
__export(index_exports, {
	QueryClient: () => import_react_query2.QueryClient,
	QueryClientProvider: () => import_react_query2.QueryClientProvider,
	createQueryClient: () => createQueryClient,
	getQueryClient: () => getQueryClient,
	useInfiniteQuery: () => import_react_query2.useInfiniteQuery,
	useMutation: () => import_react_query2.useMutation,
	useQuery: () => import_react_query2.useQuery,
	useQueryClient: () => import_react_query2.useQueryClient,
});
module.exports = __toCommonJS(index_exports);
const import_react_query = require('@tanstack/react-query');
var import_react_query2 = require('@tanstack/react-query');
let queryClient;
function getQueryClient() {
	if (!queryClient) {
		throw new Error('Query client is not created yet.');
	}
	return queryClient;
}
function createQueryClient() {
	if (queryClient) {
		throw new Error('Query client is already created.');
	}
	queryClient = new import_react_query.QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
				refetchOnReconnect: false,
			},
		},
	});
	return queryClient;
}
// Annotate the CommonJS export names for ESM import in node:
0 &&
	(module.exports = {
		QueryClient,
		QueryClientProvider,
		createQueryClient,
		getQueryClient,
		useInfiniteQuery,
		useMutation,
		useQuery,
		useQueryClient,
	});
//# sourceMappingURL=index.js.map
