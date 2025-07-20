import * as React from 'react';
import { __useOpenDocumentInNewTab as useOpenDocumentInNewTab } from '@elementor/editor-documents';
import { PopoverMenuList } from '@elementor/editor-ui';
import { MenuList } from '@elementor/ui';
import { fireEvent, render, screen } from '@testing-library/react';

import { useCssClassUsageByID } from '../../../hooks/use-css-class-usage-by-id';
import { CssClassUsagePopover } from '../components';
import { type EnhancedCssClassUsageContent } from '../types';

jest.mock( '../../../hooks/use-css-class-usage-by-id' );

jest.mock( '@elementor/editor-documents', () => ( {
	__useOpenDocumentInNewTab: jest.fn(),
} ) );

jest.mock( '@elementor/editor-ui', () => ( {
	...jest.requireActual( '@elementor/editor-ui' ),
	PopoverMenuList: jest.fn(),
} ) );

jest.mocked( PopoverMenuList ).mockImplementation( ( { items, menuItemContentTemplate, onSelect } ) => {
	return (
		<ul role="listbox">
			{ items.map( ( item ) => (
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events
				<li key={ item.value } role="option" onClick={ () => onSelect( item.value.toString() ) }>
					<span> { menuItemContentTemplate ? menuItemContentTemplate( item ) : null }</span>
				</li>
			) ) }
		</ul>
	);
} );

describe( 'CssClassUsagePopover', () => {
	it.only( 'should display correct header with title and total count', () => {
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

	it.only( 'should call onClose when close button is clicked', () => {
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

	it.only( 'should render list items with correct data', async () => {
		// Arrange.
		jest.mocked( useCssClassUsageByID ).mockReturnValue( {
			isLoading: false,
			data: {
				total: 3,
				content: [
					{ title: 'Page One', elements: [ 'el1', 'el2' ], pageId: 'page1', total: 2, type: 'wp-post' },
					{ title: 'Page Two', elements: [ 'el3' ], pageId: 'page2', total: 1, type: 'wp-post' },
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

	it.only( 'should render empty list when no content is provided', () => {
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

	it.only( 'should render menu items with correct structure', () => {
		jest.mocked( MenuList );
		// Arrange.
		jest.mocked( useCssClassUsageByID ).mockReturnValue( {
			isLoading: false,
			data: {
				total: 1,
				content: [
					{ title: 'Test Page', elements: [ 'el1', 'el2' ], pageId: 'page1', total: 2, type: 'wp-page' },
				],
			},
		} );

		// Act.
		render( <CssClassUsagePopover cssClassID="test-class" onClose={ () => {} } /> );

		// Assert.
		expect( screen.getByRole( 'option' ) ).toBeInTheDocument();
		expect( screen.getByText( '2' ) ).toBeInTheDocument();
	} );

	it.only( 'should open new window', () => {
		const mockNavigate = jest.fn();
		jest.mocked( useOpenDocumentInNewTab ).mockReturnValue( mockNavigate );

		// Arrange.
		jest.mocked( useCssClassUsageByID ).mockReturnValue( {
			isLoading: false,
			data: {
				total: 1,
				content: [ { title: 'Test Page', elements: [ 'el1', 'el2' ], pageId: '1', total: 2, type: 'wp-page' } ],
			},
		} );

		// Act.
		render( <CssClassUsagePopover cssClassID="test-class" onClose={ () => {} } /> );

		// Assert.
		fireEvent.click( screen.getByRole( 'option' ) );
		expect( mockNavigate ).toHaveBeenCalledWith( 1 );
	} );
} );
