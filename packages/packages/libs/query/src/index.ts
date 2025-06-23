import { QueryClient } from '@tanstack/react-query';

export {
	useQuery,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
	QueryClient,
	QueryClientProvider,
	type UseQueryResult,
} from '@tanstack/react-query';

export function createQueryClient() {
	return new QueryClient( {
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
				refetchOnReconnect: false,
			},
		},
	} );
}
