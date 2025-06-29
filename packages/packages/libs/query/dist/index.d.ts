import { QueryClient } from '@tanstack/react-query';
export { QueryClient, QueryClientProvider, UseQueryResult, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

declare function createQueryClient(): QueryClient;

export { createQueryClient };
