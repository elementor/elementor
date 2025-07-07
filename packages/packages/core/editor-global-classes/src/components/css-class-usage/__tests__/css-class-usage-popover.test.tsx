import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

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
		return render( <CssClassUsagePopover cssClassID="test-class" onClose={ () => {} } { ...props } /> );
	};

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

	// it( 'should display default count when total is undefined', () => {
	// 	mockUseCssClassUsageByID.mockReturnValue( {
	// 		data: {
	// 			content: [],
	// 			total: 0
	// 		},
	// 	} );
	//
	// 	renderPopover();
	//
	// 	expect( screen.getByText( '' ) ).toBeInTheDocument();
	// } );

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

	it.skip( 'should render list items with correct data', async () => {
		// Setup mock data
		const mockData = {
			total: 2,
			content: [
				{ title: 'Page One', elements: [ 'el1', 'el2' ], pageId: 'page1', total: 1 },
				{ title: 'Page Two', elements: [ 'el3' ], pageId: 'page2', total: 1 },
			],
		};

		// Mock the hook response with a Promise to simulate async behavior
		mockUseCssClassUsageByID.mockReturnValue( {
			data: mockData,
			isLoading: false,
		} );

		// Render the component
		renderPopover();

		// Wait for the list to be populated

		// Get the list and verify its contents

		await waitFor( () => {
			const listItems = screen.getAllByRole( 'option' );
			expect( listItems ).toHaveLength( 2 );
			// eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
			expect( listItems[ 0 ] ).toHaveTextContent( 'Page One' );
			// eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
			expect( listItems[ 0 ] ).toHaveTextContent( '2' );
			// eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
			expect( listItems[ 1 ] ).toHaveTextContent( 'Page Two' );
			// eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
			expect( listItems[ 1 ] ).toHaveTextContent( '1' );
		} );
	} );

	it.skip( 'should render menu items with correct structure', async () => {
		const mockData = {
			total: 1,
			content: [ { title: 'Test Page', elements: [ 'el1', 'el2' ], pageId: 'page1' } ],
		};

		mockUseCssClassUsageByID.mockReturnValue( {
			data: mockData,
		} );

		renderPopover( mockData );

		const menuItem = await screen.findByText( 'Test Page' );
		await waitFor( () => expect( menuItem ).toBeInTheDocument() );
		expect( screen.getByText( '2' ) ).toBeInTheDocument(); // elements count chip
	} );
} );
