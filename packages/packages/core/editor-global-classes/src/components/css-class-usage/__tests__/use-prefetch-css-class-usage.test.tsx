import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { act, renderHook } from '@testing-library/react';

import { apiClient } from '../../../api';
import { usePrefetchCssClassUsage } from '../hooks';
import { mockData } from './mocks/mock-data';

jest.mock( '../../../api' );
const mockedApi = apiClient as jest.Mocked< typeof apiClient >;

describe( 'usePrefetchCssClassUsage', () => {
	const wrapper = ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ new QueryClient() }>{ children }</QueryClientProvider>
	);

	it( 'should prefetch usage data and cache it', async () => {
		mockedApi.usage.mockResolvedValue( {
			data: { data: mockData },
		} );

		const { result } = renderHook( () => usePrefetchCssClassUsage(), { wrapper } );

		await act( async () => {
			await result.current.runFetch();
		} );

		expect( mockedApi.usage ).toHaveBeenCalledTimes( 1 );
	} );
} );
