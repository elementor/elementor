import * as React from 'react';
import { AxiosHeaders } from 'axios';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { act, renderHook } from '@testing-library/react';

import { apiClient } from '../../../api';
import { usePrefetchCssClassUsage } from '../hooks';
import { fetchCssClassUsage } from '../service/css-class-usage-service';
import { transformData } from '../utils';

// Mocks
jest.mock( '../../../api', () => ( {
	apiClient: {
		usage: jest.fn(),
	},
} ) );

jest.mock( '../utils', () => ( {
	transformData: jest.fn(),
} ) );

// Shared constants
const mockData = {
	'css-abc': [
		{ pageId: 'page1', elements: [ 'el-1' ], total: 1, title: 'Title1' },
		{ pageId: 'page2', elements: [ 'el-2' ], total: 1, title: 'Title2' },
	],
};

describe( 'CSS Class Usage API and Hook Integration', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'fetchCssClassUsage', () => {
		it( 'fetches and transforms data', async () => {
			const fakeRawData = { data: { some: 'raw' } };
			const fakeTransformed = { 'css-id': { total: 1, content: [] } };

			( apiClient.usage as jest.Mock ).mockResolvedValue( { data: fakeRawData } );
			( transformData as jest.Mock ).mockReturnValue( fakeTransformed );

			const result = await fetchCssClassUsage();

			expect( apiClient.usage ).toHaveBeenCalled();
			expect( transformData ).toHaveBeenCalledWith( fakeRawData.data );
			expect( result ).toBe( fakeTransformed );
		} );
	} );

	describe( 'usePrefetchCssClassUsage', () => {
		const wrapper = ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ new QueryClient() }>{ children }</QueryClientProvider>
		);

		it( 'should prefetch usage data and cache it', async () => {
			( apiClient.usage as jest.Mock ).mockResolvedValue( {
				data: {
					data: mockData,
					meta: {},
				},
				status: 200,
				statusText: 'OK',
				headers: {},
				config: {
					headers: new AxiosHeaders(),
				},
			} );

			const { result } = renderHook( () => usePrefetchCssClassUsage(), { wrapper } );

			await act( async () => {
				await result.current.prefetchClassesUsage();
			} );

			expect( apiClient.usage ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
