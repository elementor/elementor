import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { renderHook, waitFor } from '@testing-library/react';

import { apiClient } from '../../../api';
import { useCssClassUsage } from '../hooks';

jest.mock( '../../../api' );
const mockedApi = apiClient as jest.Mocked< typeof apiClient >;

describe( 'useCssClassUsage', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	const wrapper = ( { children }: { children: React.ReactNode } ) => {
		const queryClient = new QueryClient( {
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		} );

		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};

	it( 'returns query result with data', async () => {
		// Arrange
		mockedApi.usage.mockResolvedValue( {
			data: {
				data: {
					'test-id': [ { pageId: 'page1', elements: [ 'el-1' ], title: 'Page 1', total: 1 } ],
				},
			},
		} );

		// Act
		const { result } = renderHook( () => useCssClassUsage(), { wrapper } );

		// Assert
		await waitFor( () => {
			expect( result.current.isSuccess ).toBe( true );
		} );

		expect( result.current.data ).toBeDefined();
		expect( mockedApi.usage ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'handles error state', async () => {
		// Arrange
		mockedApi.usage.mockRejectedValue( new Error( 'API Error' ) );

		// Act
		const { result } = renderHook( () => useCssClassUsage(), { wrapper } );

		// Assert
		await waitFor( () => {
			expect( result.current.isError ).toBe( true );
		} );

		expect( result.current.error ).toBeDefined();
	} );
} );
