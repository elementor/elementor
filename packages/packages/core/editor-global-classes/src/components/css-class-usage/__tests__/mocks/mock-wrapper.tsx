import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@elementor/query';

export const mockCreateWrapper = ( children: React.ReactNode ) => {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	} );
	jest.clearAllMocks();
	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
};
