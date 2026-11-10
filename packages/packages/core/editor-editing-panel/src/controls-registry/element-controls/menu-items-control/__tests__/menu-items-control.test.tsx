import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import { getContainer, getElementType, useElementChildren, useElementEditorSettings } from '@elementor/editor-elements';
import { fireEvent, screen } from '@testing-library/react';

import { mockElement } from '../../../../__tests__/utils';
import { useElement } from '../../../../contexts/element-context';
import { MenuItemsControl } from '../menu-items-control';
import { useEntryItem } from '../use-entry-item';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../../../contexts/element-context', () => ( {
	...jest.requireActual( '../../../../contexts/element-context' ),
	useElement: jest.fn(),
} ) );
jest.mock( '../../../../components/settings-control', () => ( {
	SettingsControl: ( { control }: { control: { value: { bind: string } } } ) => (
		<div data-testid={ `settings-control-${ control.value.bind }` } />
	),
} ) );
jest.mock( '../use-entry-item' );

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
		expect( screen.getByTestId( 'settings-control-link' ) ).toBeInTheDocument();
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
