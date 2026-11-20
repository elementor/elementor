import { QueryClient } from '@tanstack/react-query';

export {
	keepPreviousData,
	QueryClient,
	QueryClientProvider,
	useInfiniteQuery,
	useIsMutating,
	useMutation,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from '@tanstack/react-query';

let queryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
	if ( ! queryClient ) {
		throw new Error( 'Query client is not created yet.' );
	}

	return queryClient;
}

export function createQueryClient() {
	if ( queryClient ) {
		throw new Error( 'Query client is already created.' );
	}

	queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
				refetchOnReconnect: false,
			},
		},
	} );

	return queryClient;
}
