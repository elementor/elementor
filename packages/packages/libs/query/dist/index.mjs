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
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
      }
    }
  });
}
export {
  QueryClient2 as QueryClient,
  QueryClientProvider,
  createQueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
};
//# sourceMappingURL=index.mjs.map