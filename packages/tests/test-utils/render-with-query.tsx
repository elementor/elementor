import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@elementor/query';

import { renderWithTheme } from './render-with-theme';

export default function renderWithQuery( ui: React.ReactElement ) {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	} );

	const view = renderWithTheme( <QueryClientProvider client={ queryClient }>{ ui }</QueryClientProvider> );

	return {
		...view,
		queryClient,
	};
}
