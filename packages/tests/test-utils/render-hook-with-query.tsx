import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { renderHook } from '@testing-library/react';

export default function renderHookWithQuery< T >( hook: () => T, queryClient?: QueryClient ) {
	queryClient ??= new QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	} );

	const wrapper = ( { children }: PropsWithChildren< unknown > ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	return {
		component: renderHook( hook, { wrapper } ),
		queryClient,
	};
}
