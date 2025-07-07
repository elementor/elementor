import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { act, renderHook } from '@testing-library/react';

import { apiClient } from '../../../api';
import { usePrefetchCssClassUsage } from '../hooks';

export const mockData = {
	'css-abc': [
		{ pageId: 'page1', elements: [ 'el-1' ], total: 1, title: 'Title1' },
		{ pageId: 'page2', elements: [ 'el-2' ], total: 1, title: 'Title2' },
	],
};

jest.mock( '../../../api' );
const mockedApi = apiClient as jest.Mocked< typeof apiClient >;

describe( 'usePrefetchCssClassUsage', () => {
	const wrapper = ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ new QueryClient() }>{ children }</QueryClientProvider>
	);

	it( 'should prefetch usage data and cache it', async () => {
		mockedApi.usage.mockResolvedValue( {
			data: {
				data: mockData,
			},
		} );

		const { result } = renderHook( () => usePrefetchCssClassUsage(), { wrapper } );

		await act( async () => {
			await result.current.prefetchClassesUsage();
		} );

		expect( mockedApi.usage ).toHaveBeenCalledTimes( 1 );
	} );
} );
