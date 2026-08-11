import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { ListItemsControlContent } from '../list-items-control';

const mockRepeater = jest.fn( ( _props: unknown ) => null );
const mockGetContainer = jest.fn();
const mockGetElementChildren = jest.fn();
const mockUseElementEditorSettings = jest.fn(
	( _elementId: string ): { label?: string } => ( { label: 'Item 1' } )
);

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateUseListenTo: ( _events: unknown[], getValue: () => unknown ) => getValue(),
	commandEndEvent: ( command: string ) => command,
	v1ReadyEvent: () => 'ready',
	windowEvent: ( event: string ) => event,
} ) );

jest.mock( '@elementor/editor-controls', () => ( {
	Repeater: ( props: unknown ) => {
		mockRepeater( props );
		return null;
	},
	ControlFormLabel: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	getContainer: ( ...args: unknown[] ) => mockGetContainer( ...args ),
	getElementChildrenWithFallback: ( ...args: unknown[] ) => mockGetElementChildren( ...args ),
	updateElementEditorSettings: jest.fn(),
	useElementEditorSettings: ( elementId: string ) => mockUseElementEditorSettings( elementId ),
} ) );

jest.mock( '../../../../contexts/element-context', () => ( {
	useElement: () => ( { element: { id: 'list-1' } } ),
} ) );

jest.mock( '../use-actions', () => ( {
	LIST_ITEM_ELEMENT_TYPE: 'e-list-item',
	useActions: () => ( {
		addItem: jest.fn(),
		duplicateItem: jest.fn(),
		moveItem: jest.fn(),
		removeItem: jest.fn(),
	} ),
} ) );

describe( 'ListItemsControlContent', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetContainer.mockReturnValue( { id: 'list-1', model: {} } );
		mockUseElementEditorSettings.mockReturnValue( { label: 'Item 1' } );
	} );

	it( 'hides remove when only one item exists', () => {
		mockGetElementChildren.mockReturnValue( [
			{
				model: {
					get: ( key: string ) => {
						if ( key === 'id' ) {
							return 'item-1';
						}

						if ( key === 'editor_settings' ) {
							return { label: 'Item 1' };
						}

						return undefined;
					},
				},
			},
		] );

		render( <ListItemsControlContent label="List Items" /> );

		expect( mockRepeater ).toHaveBeenCalledWith(
			expect.objectContaining( {
				showRemove: false,
			} )
		);
	} );

	it( 'shows remove when multiple items exist', () => {
		mockGetElementChildren.mockReturnValue( [
			{
				model: {
					get: ( key: string ) => {
						if ( key === 'id' ) {
							return 'item-1';
						}

						if ( key === 'editor_settings' ) {
							return { label: 'Item 1' };
						}

						return undefined;
					},
				},
			},
			{
				model: {
					get: ( key: string ) => {
						if ( key === 'id' ) {
							return 'item-2';
						}

						if ( key === 'editor_settings' ) {
							return { label: 'Item 2' };
						}

						return undefined;
					},
				},
			},
		] );

		render( <ListItemsControlContent label="List Items" /> );

		expect( mockRepeater ).toHaveBeenCalledWith(
			expect.objectContaining( {
				showRemove: true,
			} )
		);
	} );

	it( 'populates the popover input with the effective item label when editor settings are empty', () => {
		mockGetElementChildren.mockReturnValue( [
			{
				model: {
					get: ( key: string ) => {
						if ( key === 'id' ) {
							return 'item-1';
						}

						if ( key === 'editor_settings' ) {
							return {};
						}

						return undefined;
					},
				},
			},
		] );
		mockUseElementEditorSettings.mockReturnValue( {} );

		render( <ListItemsControlContent label="List Items" /> );

		const repeaterProps = mockRepeater.mock.calls[ 0 ][ 0 ] as {
			itemSettings: {
				Content: React.ComponentType< {
					value: { id: string; title: string };
					index: number;
					anchorEl: HTMLElement | null;
					bind: string;
				} >;
			};
		};

		const Content = repeaterProps.itemSettings.Content;

		render( <Content value={ { id: 'item-1', title: 'Item 1' } } index={ 0 } anchorEl={ null } bind="ignored" /> );

		expect( screen.getByDisplayValue( 'Item 1' ) ).toBeInTheDocument();
	} );
} );
