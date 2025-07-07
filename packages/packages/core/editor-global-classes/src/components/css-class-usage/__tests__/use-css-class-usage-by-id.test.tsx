import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { renderHook } from '@testing-library/react';

import { useCssClassUsageByID } from '../hooks';

// Mock the useCssClassUsage hook
jest.mock( '../hooks/use-css-class-usage', () => ( {
	useCssClassUsage: jest.fn(),
} ) );

describe( 'useCssClassUsageByID', () => {
	let queryClient: QueryClient;

	beforeEach( () => {
		queryClient = new QueryClient( {
			defaultOptions: {
				queries: { retry: false },
			},
		} );
		jest.clearAllMocks();
	} );

	const createWrapper = ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	it( 'should return empty class usage when no data for ID exists', () => {
		// Arrange
		const testId = 'non-existent-id';
		require( '../hooks/use-css-class-usage' ).useCssClassUsage.mockReturnValue( {
			data: {},
			isLoading: false,
		} );

		// Act
		const { result } = renderHook( () => useCssClassUsageByID( testId ), {
			wrapper: createWrapper,
		} );

		// Assert
		expect( result.current.data ).toEqual( { total: 0, content: [] } );
		expect( result.current.isLoading ).toBe( false );
	} );

	it( 'should return class usage data for existing ID', () => {
		// Arrange
		const testId = 'existing-id';
		const mockClassData = {
			total: 2,
			content: [
				{ pageId: 'page1', elements: [ 'el-1' ], title: 'Title1' },
				{ pageId: 'page2', elements: [ 'el-2' ], title: 'Title2' },
			],
		};

		require( '../hooks/use-css-class-usage' ).useCssClassUsage.mockReturnValue( {
			data: { [ testId ]: mockClassData },
			isLoading: false,
		} );

		// Act
		const { result } = renderHook( () => useCssClassUsageByID( testId ), {
			wrapper: createWrapper,
		} );

		// Assert
		expect( result.current.data ).toEqual( mockClassData );
		expect( result.current.isLoading ).toBe( false );
	} );

	it( 'should reflect loading state from useCssClassUsage', () => {
		// Arrange
		const testId = 'test-id';
		require( '../hooks/use-css-class-usage' ).useCssClassUsage.mockReturnValue( {
			data: null,
			isLoading: true,
		} );

		// Act
		const { result } = renderHook( () => useCssClassUsageByID( testId ), {
			wrapper: createWrapper,
		} );

		// Assert
		expect( result.current.data ).toEqual( { total: 0, content: [] } );
		expect( result.current.isLoading ).toBe( true );
	} );

	it( 'should update when data changes', () => {
		// Arrange
		const testId = 'test-id';
		const mockUseCssClassUsage = require( '../hooks/use-css-class-usage' ).useCssClassUsage;

		mockUseCssClassUsage.mockReturnValue( {
			data: { [ testId ]: { total: 1, content: [] } },
			isLoading: false,
		} );

		// Act
		const { result, rerender } = renderHook( () => useCssClassUsageByID( testId ), {
			wrapper: createWrapper,
		} );

		// Assert initial state
		expect( result.current.data ).toEqual( { total: 1, content: [] } );

		// Update mock data
		mockUseCssClassUsage.mockReturnValue( {
			data: {
				[ testId ]: { total: 2, content: [ { pageId: 'new-page', elements: [ 'new-el' ], title: 'New' } ] },
			},
			isLoading: false,
		} );

		// Rerender hook
		rerender();

		// Assert updated state
		expect( result.current.data ).toEqual( {
			total: 2,
			content: [ { pageId: 'new-page', elements: [ 'new-el' ], title: 'New' } ],
		} );
	} );
} );
