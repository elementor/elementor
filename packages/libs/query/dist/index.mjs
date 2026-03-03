// src/index.ts
import { QueryClient } from "@tanstack/react-query";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  QueryClient as QueryClient2,
  QueryClientProvider
} from "@tanstack/react-query";
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
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
      }
    }
  });
  return queryClient;
}
export {
  QueryClient2 as QueryClient,
  QueryClientProvider,
  createQueryClient,
  getQueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
};
//# sourceMappingURL=index.mjs.map