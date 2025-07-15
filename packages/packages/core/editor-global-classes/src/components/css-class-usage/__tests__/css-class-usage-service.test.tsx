import * as React from 'react';
import { AxiosHeaders } from 'axios';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { act, renderHook } from '@testing-library/react';

import { fetchCssClassUsage } from '../../../../service/css-class-usage-service';
import { apiClient } from '../../../api';
import { usePrefetchCssClassUsage } from '../../../hooks/use-prefetch-css-class-usage';
import { type CssClassUsage } from '../types';
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
		{ pageId: 'page1', elements: [ 'el-1' ], total: 1, title: 'Title1', type: 'wp-page' },
		{ pageId: 'page2', elements: [ 'el-2' ], total: 1, title: 'Title2', type: 'wp-page' },
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

			jest.mocked( apiClient.usage as jest.Mock ).mockResolvedValue( { data: fakeRawData } );
			jest.mocked( transformData ).mockReturnValue( fakeTransformed );

			const result = await fetchCssClassUsage();

			expect( apiClient.usage ).toHaveBeenCalled();
			expect( transformData ).toHaveBeenCalledWith( fakeRawData.data );
			expect( result ).toBe( fakeTransformed );
		} );
	} );

	describe( 'usePrefetchCssClassUsage', () => {
		it( 'should prefetch usage data and cache it', async () => {
			const wrapper = ( { children }: { children: React.ReactNode } ) => (
				<QueryClientProvider client={ new QueryClient() }>{ children }</QueryClientProvider>
			);

			jest.mocked( apiClient.usage ).mockResolvedValue( {
				data: {
					data: mockData as CssClassUsage, // Mocked data
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
