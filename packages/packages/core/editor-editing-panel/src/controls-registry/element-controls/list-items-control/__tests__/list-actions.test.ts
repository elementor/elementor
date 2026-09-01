import {
	createElements,
	duplicateElements,
	generateElementId,
	getContainer,
	moveElements,
	removeElements,
	type V1Element,
	type V1ElementData,
} from '@elementor/editor-elements';

import { addItem, duplicateItem, moveItem, removeItem } from '../list-actions';

jest.mock( '@elementor/editor-elements' );

describe( 'list-items-control actions', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		let idCounter = 0;
		jest.mocked( generateElementId ).mockImplementation( () => `generated-${ ++idCounter }` );
	} );

	const getCreatedItemModel = () => {
		return jest.mocked( createElements ).mock.calls[ 0 ][ 0 ].elements[ 0 ].model as unknown as V1ElementData;
	};

	it( 'creates a self-contained list item at the requested position', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( {
			id: 'list-123',
		} as unknown as V1Element );

		// Act.
		addItem( {
			existingTitles: [ 'Item 1', 'Item 2' ],
			listContainerId: 'list-123',
			items: [ { item: { id: 'new-item' }, index: 2 } ],
			showMarkers: true,
		} );

		// Assert.
		expect( createElements ).toHaveBeenCalledWith(
			expect.objectContaining( {
				elements: [
					expect.objectContaining( {
						container: expect.anything(),
						options: { at: 2 },
					} ),
				],
			} )
		);

		expect( getCreatedItemModel() ).toEqual(
			expect.objectContaining( {
				elType: 'e-list-item',
				settings: {
					show_markers: { $$type: 'boolean', value: true },
				},
				editor_settings: {
					title: 'Item 3',
					initial_position: 3,
				},
			} )
		);
	} );

	it( 'uses the next untaken item number after a delete', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( {
			id: 'list-123',
		} as unknown as V1Element );

		// Act.
		addItem( {
			existingTitles: [ 'Item 2' ],
			listContainerId: 'list-123',
			items: [ { item: { id: 'new-item' }, index: 1 } ],
			showMarkers: true,
		} );

		// Assert.
		expect( createElements ).toHaveBeenCalledWith(
			expect.objectContaining( {
				elements: [
					expect.objectContaining( {
						model: expect.objectContaining( {
							editor_settings: expect.objectContaining( {
								title: 'Item 3',
								initial_position: 3,
							} ),
						} ),
					} ),
				],
			} )
		);
	} );

	it( 'seeds a new list item from the root show_markers value, not the schema default', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( {
			id: 'list-123',
		} as unknown as V1Element );

		// Act.
		addItem( {
			existingTitles: [],
			listContainerId: 'list-123',
			items: [ { item: { id: 'new-item' }, index: 0 } ],
			showMarkers: false,
		} );

		// Assert.
		expect( createElements ).toHaveBeenCalledWith(
			expect.objectContaining( {
				elements: [
					expect.objectContaining( {
						model: expect.objectContaining( {
							settings: {
								show_markers: { $$type: 'boolean', value: false },
							},
						} ),
					} ),
				],
			} )
		);
	} );

	it( 'builds the marker and content subtree for a created list item', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( {
			id: 'list-123',
		} as unknown as V1Element );

		// Act.
		addItem( {
			existingTitles: [],
			listContainerId: 'list-123',
			items: [ { item: { id: 'new-item' }, index: 0 } ],
			showMarkers: true,
		} );

		// Assert.
		const model = getCreatedItemModel();
		const [ marker, content ] = model.elements ?? [];
		const markerChild = marker?.elements?.[ 0 ];
		const paragraph = content?.elements?.[ 0 ];

		expect( marker ).toEqual(
			expect.objectContaining( {
				elType: 'e-list-item-marker',
				editor_settings: { title: 'Marker' },
			} )
		);
		expect( markerChild ).toEqual(
			expect.objectContaining( {
				elType: 'widget',
				widgetType: 'e-svg',
				elements: [],
			} )
		);
		expect( content ).toEqual(
			expect.objectContaining( {
				elType: 'e-list-item-content',
				editor_settings: { title: 'Content' },
			} )
		);
		expect( paragraph ).toEqual(
			expect.objectContaining( {
				elType: 'widget',
				widgetType: 'e-paragraph',
				elements: [],
				settings: {
					paragraph: {
						$$type: 'escaped-html',
						value: 'List item',
					},
				},
			} )
		);
	} );

	it( 'generates a unique id for every created node in the subtree', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( {
			id: 'list-123',
		} as unknown as V1Element );

		// Act.
		addItem( {
			existingTitles: [],
			listContainerId: 'list-123',
			items: [ { item: { id: 'new-item' }, index: 0 } ],
			showMarkers: true,
		} );

		// Assert.
		const ids: string[] = [];
		const collectIds = ( node: V1ElementData ) => {
			ids.push( node.id );
			( node.elements ?? [] ).forEach( collectIds );
		};

		collectIds( getCreatedItemModel() );

		expect( ids ).toHaveLength( 5 );
		expect( new Set( ids ).size ).toBe( 5 );
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
