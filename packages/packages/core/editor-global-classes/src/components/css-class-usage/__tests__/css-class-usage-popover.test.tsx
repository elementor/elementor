import * as React from 'react';
import { renderWithQuery } from 'test-utils';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';

import { CssClassUsagePopover } from '../components';

// Mock the required hooks and components
jest.mock( '../hooks/use-css-class-usage-by-id', () => ( {
	useCssClassUsageByID: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

describe( 'CssClassUsagePopover', () => {
	const mockUseCssClassUsageByID = jest.requireMock( '../hooks/use-css-class-usage-by-id' ).useCssClassUsageByID;

	beforeEach( () => {
		globalThis.Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue( { height: 1000, width: 1000 } );
	} );

	const renderPopover = ( props = {} ) => {
		return renderWithQuery( <CssClassUsagePopover cssClassID="test-class" onClose={ () => {} } { ...props } /> );
	};

	describe( 'Header', () => {
		it( 'should display correct header with title and total count', () => {
			mockUseCssClassUsageByID.mockReturnValue( {
				data: {
					total: 5,
					content: [],
				},
			} );

			renderPopover();

			expect( screen.getByLabelText( 'header-title' ) ).toHaveTextContent( 'Locator' );
			expect( screen.getByText( '5' ) ).toBeInTheDocument();
		} );

		it( 'should display default count when total is undefined', () => {
			mockUseCssClassUsageByID.mockReturnValue( {
				data: {
					content: [],
				},
			} );

			renderPopover();

			expect( screen.getByText( '1' ) ).toBeInTheDocument();
		} );

		it( 'should call onClose when close button is clicked', () => {
			const onClose = jest.fn();
			mockUseCssClassUsageByID.mockReturnValue( {
				data: {
					total: 1,
					content: [],
				},
			} );

			renderPopover( { onClose } );

			const closeButton = screen.getByRole( 'button', { name: /close/i } );
			fireEvent.click( closeButton );

			expect( onClose ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'Content List', () => {
		it( 'should render list items with correct data', async () => {
			// Setup mock data
			const mockData = {
				total: 2,
				content: [
					{ title: 'Page One', elements: [ 'el1', 'el2' ], pageId: 'page1' },
					{ title: 'Page Two', elements: [ 'el3' ], pageId: 'page2' },
				],
			};

			// Mock the hook response with a Promise to simulate async behavior
			mockUseCssClassUsageByID.mockReturnValue( {
				data: mockData,
				isLoading: false,
			} );

			// Render the component
			const { rerender } = renderPopover();

			// Force a re-render to ensure the async data is processed
			await act( async () => {
				rerender();
			} );

			// Wait for the list to be populated
			await waitFor(
				() => {
					const list = screen.getByTestId( 'css-class-usage-list' );
					expect( list.children.length ).toBeGreaterThan( 0 );
				},
				{ timeout: 2000 }
			);

			// Get the list and verify its contents
			const list = screen.getByTestId( 'css-class-usage-list' );
			const listItems = within( list ).getAllByRole( 'option' );

			// Verify the list items
			expect( listItems ).toHaveLength( 2 );
			expect( listItems[ 0 ] ).toHaveTextContent( 'Page One' );
			expect( listItems[ 0 ] ).toHaveTextContent( '2' );
			expect( listItems[ 1 ] ).toHaveTextContent( 'Page Two' );
			expect( listItems[ 1 ] ).toHaveTextContent( '1' );
		} );
	} );

	describe( 'Menu Items', () => {
		it( 'should render menu items with correct structure', () => {
			const mockData = {
				total: 1,
				content: [ { title: 'Test Page', elements: [ 'el1', 'el2' ], pageId: 'page1' } ],
			};

			mockUseCssClassUsageByID.mockReturnValue( {
				data: mockData,
			} );

			renderPopover();

			const menuItem = screen.getByText( 'Test Page' ).closest( '[role="option"]' );
			expect( menuItem ).toBeInTheDocument();
			expect( screen.getByText( '2' ) ).toBeInTheDocument(); // elements count chip
		} );
	} );
} );
