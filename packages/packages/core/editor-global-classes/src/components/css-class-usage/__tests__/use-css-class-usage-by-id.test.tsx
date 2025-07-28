import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { renderHook, waitFor } from '@testing-library/react';

import { fetchCssClassUsage } from '../../../../service/css-class-usage-service';
import { useCssClassUsageByID } from '../../../hooks/use-css-class-usage-by-id';

jest.mock( '../../../../service/css-class-usage-service' );
const mockedFetchCssClassUsage = jest.mocked( fetchCssClassUsage );

const wrapper = ( { children }: { children: React.ReactNode } ) => (
	<QueryClientProvider client={ new QueryClient() }>{ children }</QueryClientProvider>
);

describe( 'useCssClassUsageByID', () => {
	beforeEach( () => {
		jest.resetAllMocks();
	} );

	it( 'returns usage data for a valid ID', async () => {
		jest.mocked( fetchCssClassUsage ).mockResolvedValue( {
			'css-id': {
				total: 3,
				content: [
					{ pageId: 'p1', total: 3, elements: [ 'el-1', 'el-2', 'el-3' ], title: 'Page 1', type: 'wp-page' },
				],
			},
		} );

		const { result } = renderHook( () => useCssClassUsageByID( 'css-id' ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( {
			total: 3,
			content: [
				{ pageId: 'p1', total: 3, elements: [ 'el-1', 'el-2', 'el-3' ], title: 'Page 1', type: 'wp-page' },
			],
		} );
	} );

	it( 'returns empty usage data if ID not found', async () => {
		mockedFetchCssClassUsage.mockResolvedValue( {} );

		const { result } = renderHook( () => useCssClassUsageByID( 'non-existent-id' ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( { total: 0, content: [] } );
	} );

	it( 'uses correct query key and options', async () => {
		mockedFetchCssClassUsage.mockResolvedValue( {} );

		const { result } = renderHook( () => useCssClassUsageByID( 'css-id' ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( mockedFetchCssClassUsage ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'sets loading state initially', async () => {
		mockedFetchCssClassUsage.mockImplementation(
			() => new Promise( ( resolve ) => setTimeout( () => resolve( {} ), 100 ) )
		);

		const { result } = renderHook( () => useCssClassUsageByID( 'css-id' ), { wrapper } );

		expect( result.current.isLoading ).toBe( true );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
	} );
} );
