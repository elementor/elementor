import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import { getContainer, getElementType, useElementChildren, useElementEditorSettings } from '@elementor/editor-elements';
import { fireEvent, screen } from '@testing-library/react';

import { mockElement } from '../../../../__tests__/utils';
import { useElement } from '../../../../contexts/element-context';
import { MenuItemsControl } from '../menu-items-control';
import { useEntryItem } from '../use-entry-item';
import { getSubmenuPromotion } from '../use-submenu';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../../../contexts/element-context', () => ( {
	...jest.requireActual( '../../../../contexts/element-context' ),
	useElement: jest.fn(),
} ) );
jest.mock( '../../../../components/settings-control', () => ( {
	SettingsControl: ( { control }: { control: { value: { bind: string } } } ) => {
		const { useElement: useProvidedElement } = jest.requireActual( '../../../../contexts/element-context' );

		return (
			<>
				<div>{ `settings-control-${ control.value.bind }` }</div>
				<div>{ `settings-control-element-${ useProvidedElement().element.id }` }</div>
			</>
		);
	},
} ) );
jest.mock( '../use-entry-item' );
jest.mock( '../use-submenu', () => ( {
	...jest.requireActual( '../use-submenu' ),
	getSubmenuPromotion: jest.fn(),
} ) );

describe( '<MenuItemsControl />', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( useElement ).mockReturnValue( {
			element: mockElement( { id: 'menu-1', type: 'e-menu' } ),
			elementType: createMockElementType(),
			settings: {},
		} );
		jest.mocked( getContainer ).mockReturnValue( {
			id: 'items-1',
			model: { get: () => 'e-menu-items' },
			children: [],
		} as never );
		jest.mocked( getElementType ).mockReturnValue( {
			...createMockElementType(),
			controls: [
				{
					type: 'section',
					value: {
						label: 'Settings',
						items: [ { type: 'control', value: { bind: 'link', type: 'link', props: {} } } ],
					},
				},
			],
		} );
		jest.mocked( useElementEditorSettings ).mockReturnValue( { title: 'Home' } );
		jest.mocked( useEntryItem ).mockReturnValue( { itemId: 'item-1', settings: {} } );
		jest.mocked( getSubmenuPromotion ).mockReturnValue( {
			title: 'Mega Menu',
			content: 'content',
			ctaUrl: 'https://go.example',
		} );
	} );

	const renderControl = ( entryCount: number ) => {
		jest.mocked( useElementChildren ).mockReturnValue( {
			'e-menu-entry': Array.from( { length: entryCount }, ( _, i ) => ( {
				id: `entry-${ i }`,
				editorSettings: { title: 'Home' },
			} ) ),
		} );

		return renderWithTheme( <MenuItemsControl label="Menu items" /> );
	};

	it( 'should render the item name and link in the row popover bound to the entry item', async () => {
		// Arrange
		renderControl( 2 );

		// Act
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Open item' } )[ 0 ] );

		// Assert
		expect( await screen.findByText( 'Item name' ) ).toBeInTheDocument();
		expect( screen.getByText( 'settings-control-link' ) ).toBeInTheDocument();
	} );

	it( 'should bind the row link to the Menu Item so the link-in-link restriction checks the Menu Item', async () => {
		// Arrange
		renderControl( 1 );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Open item' } ) );

		// Assert
		expect( await screen.findByText( 'settings-control-element-item-1' ) ).toBeInTheDocument();
	} );

	it( 'should render the locked Enable Submenu switch for the entry in the row popover', async () => {
		// Arrange
		renderControl( 2 );

		// Act
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Open item' } )[ 1 ] );

		// Assert
		expect( await screen.findByText( 'Item name' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Enable Submenu', { selector: 'input' } ) ).not.toBeChecked();
		expect( screen.getByLabelText( 'Promotion chip' ) ).toBeInTheDocument();
	} );

	it( 'should offer removing entries only while more than one remains', () => {
		// Arrange & Act
		const { unmount } = renderControl( 2 );

		// Assert
		expect( screen.getAllByLabelText( 'Remove' ) ).toHaveLength( 2 );

		// Act
		unmount();
		renderControl( 1 );

		// Assert
		expect( screen.queryByLabelText( 'Remove' ) ).not.toBeInTheDocument();
	} );
} );
