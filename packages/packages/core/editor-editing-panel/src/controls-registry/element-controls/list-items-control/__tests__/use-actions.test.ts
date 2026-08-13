import {
	createElements,
	duplicateElements,
	getContainer,
	moveElements,
	removeElements,
	type V1Element,
} from '@elementor/editor-elements';

import { addItem, duplicateItem, moveItem, removeItem } from '../use-actions';

jest.mock( '@elementor/editor-elements' );

describe( 'list-items-control actions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'creates a hydrated list item at the requested position', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( {
			id: 'list-123',
		} as unknown as V1Element );

		// Act.
		addItem( {
			listContainerId: 'list-123',
			items: [ { item: { id: 'new-item' }, index: 2 } ],
		} );

		// Assert.
		expect( createElements ).toHaveBeenCalledWith(
			expect.objectContaining( {
				elements: [
					expect.objectContaining( {
						container: expect.anything(),
						model: expect.objectContaining( {
							elType: 'e-list-item',
							hydrateDefaultChildren: true,
							editor_settings: expect.objectContaining( {
								title: 'Item 3',
								initial_position: 3,
							} ),
						} ),
						options: { at: 2 },
					} ),
				],
			} )
		);
	} );

	it( 'duplicates the selected list item subtree', () => {
		// Act.
		duplicateItem( {
			items: [ { item: { id: 'item-1' }, index: 0 } ],
		} );

		// Assert.
		expect( duplicateElements ).toHaveBeenCalledWith(
			expect.objectContaining( {
				elementIds: [ 'item-1' ],
			} )
		);
	} );

	it( 'removes the selected list items', () => {
		// Act.
		removeItem( {
			items: [
				{ item: { id: 'item-1' }, index: 0 },
				{ item: { id: 'item-2' }, index: 1 },
			],
		} );

		// Assert.
		expect( removeElements ).toHaveBeenCalledWith(
			expect.objectContaining( {
				elementIds: [ 'item-1', 'item-2' ],
			} )
		);
	} );

	it( 'reorders a list item inside the list root', () => {
		// Arrange.
		const listContainer = { id: 'list-123' } as unknown as V1Element;
		const movedElement = { id: 'item-2' } as unknown as V1Element;

		jest.mocked( getContainer ).mockImplementation( ( id ) => {
			if ( id === 'list-123' ) {
				return listContainer;
			}

			if ( id === 'item-2' ) {
				return movedElement;
			}

			return null;
		} );

		// Act.
		moveItem( {
			toIndex: 0,
			listContainerId: 'list-123',
			movedElementId: 'item-2',
		} );

		// Assert.
		expect( moveElements ).toHaveBeenCalledWith(
			expect.objectContaining( {
				moves: [
					expect.objectContaining( {
						element: movedElement,
						targetContainer: listContainer,
						options: { at: 0 },
					} ),
				],
			} )
		);
	} );
} );
