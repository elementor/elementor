import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { CssClassUsagePopover } from '../components';
import { useCssClassUsageByID } from '../hooks';
import { type EnhancedCssClassUsageContent } from '../types';

jest.mock( '../hooks/use-css-class-usage-by-id' );

describe( 'CssClassUsagePopover', () => {
	beforeEach( () => {
		globalThis.Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue( { height: 1000, width: 1000 } );
	} );

	it( 'should display correct header with title and total count', () => {
		// Arrange.
		jest.mocked( useCssClassUsageByID ).mockReturnValue( {
			isLoading: false,
			data: {
				total: 5,
				content: [],
			} as unknown as EnhancedCssClassUsageContent,
		} );

		// Act.
		render( <CssClassUsagePopover cssClassID="test-class" onClose={ () => {} } /> );

		// Assert.
		expect( screen.getByLabelText( 'header-title' ) ).toHaveTextContent( 'Locator' );
		expect( screen.getByText( '5' ) ).toBeInTheDocument();
	} );

	it.skip( 'should display default count when total is undefined', () => {
		// Arrange.
		jest.mocked( useCssClassUsageByID ).mockReturnValue( {
			isLoading: false,
			data: {
				total: 0,
				content: [],
			},
		} );

		// Act.
		render( <CssClassUsagePopover cssClassID="test-class" onClose={ () => {} } /> );

		// Assert.
		expect( screen.getByText( '1' ) ).toBeInTheDocument();
	} );

	it( 'should call onClose when close button is clicked', () => {
		// Arrange.
		const onClose = jest.fn();
		jest.mocked( useCssClassUsageByID ).mockReturnValue( {
			isLoading: false,
			data: {
				total: 1,
				content: [],
			},
		} );

		// Act.
		render( <CssClassUsagePopover cssClassID="test-class" onClose={ onClose } /> );

		const closeButton = screen.getByRole( 'button', { name: /close/i } );
		fireEvent.click( closeButton );

		// Assert.
		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should render list items with correct data', async () => {
		// Arrange.
		jest.mocked( useCssClassUsageByID ).mockReturnValue( {
			isLoading: false,
			data: {
				total: 3,
				content: [
					{ title: 'Page One', elements: [ 'el1', 'el2' ], pageId: 'page1', total: 2, type: 'Post' },
					{ title: 'Page Two', elements: [ 'el3' ], pageId: 'page2', total: 1, type: 'Post' },
				],
			},
		} );

		// Act.
		render( <CssClassUsagePopover cssClassID="test-class" onClose={ () => {} } /> );

		// Assert.
		expect( screen.getByText( 'Page One' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Page Two' ) ).toBeInTheDocument();
		expect( screen.getByText( '2' ) ).toBeInTheDocument(); // elements count for Page One
		expect( screen.getByText( '1' ) ).toBeInTheDocument(); // elements count for Page Two
	} );

	it( 'should render empty list when no content is provided', () => {
		// Arrange.
		jest.mocked( useCssClassUsageByID ).mockReturnValue( {
			isLoading: false,
			data: {
				total: 0,
				content: [],
			},
		} );

		// Act.
		render( <CssClassUsagePopover cssClassID="test-class" onClose={ () => {} } /> );

		// Assert.
		expect( screen.getByRole( 'listbox' ) ).toBeEmptyDOMElement();
	} );

	it( 'should render menu items with correct structure', () => {
		// Arrange.
		jest.mocked( useCssClassUsageByID ).mockReturnValue( {
			isLoading: false,
			data: {
				total: 1,
				content: [
					{ title: 'Test Page', elements: [ 'el1', 'el2' ], pageId: 'page1', total: 2, type: 'Page' },
				],
			},
		} );

		// Act.
		render( <CssClassUsagePopover cssClassID="test-class" onClose={ () => {} } /> );

		// Assert.
		expect( screen.getByRole( 'option' ) ).toBeInTheDocument();
		expect( screen.getByText( '2' ) ).toBeInTheDocument();
	} );
} );
