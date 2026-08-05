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
import { renderHook } from '@testing-library/react';

import { useActions } from '../use-actions';

jest.mock( '@elementor/editor-elements' );

describe( 'accordion-items-control actions', () => {
	const ACCORDION_ID = 'accordion-123';

	beforeEach( () => {
		jest.clearAllMocks();

		let idCounter = 0;
		jest.mocked( generateElementId ).mockImplementation( () => `generated-${ ++idCounter }` );

		jest.mocked( getContainer ).mockImplementation(
			( elementId: string ) => ( { id: elementId } ) as unknown as V1Element
		);
	} );

	const getCreatedItemModel = () => {
		return jest.mocked( createElements ).mock.calls[ 0 ][ 0 ].elements[ 0 ].model as unknown as V1ElementData;
	};

	describe( 'addItem', () => {
		it( 'should create a single self-contained accordion item', () => {
			// Arrange.
			const { result } = renderHook( () => useActions() );

			// Act.
			result.current.addItem( {
				accordionId: ACCORDION_ID,
				items: [ { item: { id: '' }, index: 2 } ],
			} );

			// Assert.
			expect( createElements ).toHaveBeenCalledTimes( 1 );
			expect( jest.mocked( createElements ).mock.calls[ 0 ][ 0 ].elements ).toHaveLength( 1 );

			const model = getCreatedItemModel();

			expect( model.elType ).toBe( 'e-accordion-item' );
			expect( model.editor_settings ).toEqual( { title: 'Accordion Item 3', initial_position: 3 } );
		} );

		it( 'should create one item per added repeater item', () => {
			// Arrange.
			const { result } = renderHook( () => useActions() );

			// Act.
			result.current.addItem( {
				accordionId: ACCORDION_ID,
				items: [
					{ item: { id: '' }, index: 2 },
					{ item: { id: '' }, index: 3 },
				],
			} );

			// Assert.
			expect( createElements ).toHaveBeenCalledTimes( 2 );
			expect(
				jest
					.mocked( createElements )
					.mock.calls.map(
						( [ { elements } ] ) =>
							( elements[ 0 ].model as unknown as V1ElementData ).editor_settings?.title
					)
			).toEqual( [ 'Accordion Item 3', 'Accordion Item 4' ] );
		} );

		it( 'should build the head/title/icon/content subtree of the added item', () => {
			// Arrange.
			const { result } = renderHook( () => useActions() );

			// Act.
			result.current.addItem( {
				accordionId: ACCORDION_ID,
				items: [ { item: { id: '' }, index: 0 } ],
			} );

			// Assert.
			const model = getCreatedItemModel();
			const [ head, content ] = model.elements ?? [];
			const [ title, icon ] = head?.elements ?? [];

			expect( head.elType ).toBe( 'e-accordion-item-head' );
			expect( content.elType ).toBe( 'e-accordion-item-content' );
			expect( content.hydrateDefaultChildren ).toBe( true );
			expect( title.elType ).toBe( 'e-accordion-item-title' );
			expect( icon.elType ).toBe( 'e-accordion-item-icon' );
			expect( icon.hydrateDefaultChildren ).toBe( true );
		} );

		it( 'should number the rendered title paragraph the same way the default tree does', () => {
			// Arrange.
			const { result } = renderHook( () => useActions() );

			// Act.
			result.current.addItem( {
				accordionId: ACCORDION_ID,
				items: [ { item: { id: '' }, index: 2 } ],
			} );

			// Assert.
			const model = getCreatedItemModel();
			const paragraph = model.elements?.[ 0 ].elements?.[ 0 ].elements?.[ 0 ];

			expect( paragraph ).toEqual(
				expect.objectContaining( {
					elType: 'widget',
					widgetType: 'e-paragraph',
					settings: {
						paragraph: {
							$$type: 'html-v3',
							value: {
								content: { $$type: 'string', value: 'Accordion Item 3' },
								children: [],
							},
						},
						tag: { $$type: 'string', value: 'span' },
					},
				} )
			);
		} );

		it( 'should generate an id for every node of the added subtree', () => {
			// Arrange.
			const { result } = renderHook( () => useActions() );

			// Act.
			result.current.addItem( {
				accordionId: ACCORDION_ID,
				items: [ { item: { id: '' }, index: 0 } ],
			} );

			// Assert.
			const ids: string[] = [];
			const collectIds = ( node: V1ElementData ) => {
				ids.push( node.id );
				( node.elements ?? [] ).forEach( collectIds );
			};

			collectIds( getCreatedItemModel() );

			expect( ids ).toHaveLength( 6 );
			expect( new Set( ids ).size ).toBe( 6 );
		} );

		it( 'should throw when the accordion container is not found', () => {
			// Arrange.
			jest.mocked( getContainer ).mockReturnValue( null );

			const { result } = renderHook( () => useActions() );

			// Act & Assert.
			expect( () => {
				result.current.addItem( {
					accordionId: ACCORDION_ID,
					items: [ { item: { id: '' }, index: 0 } ],
				} );
			} ).toThrow( 'Accordion container not found' );
		} );
	} );

	describe( 'removeItem', () => {
		it( 'should remove only the item element itself', () => {
			// Arrange.
			const { result } = renderHook( () => useActions() );

			// Act.
			result.current.removeItem( {
				items: [ { item: { id: 'item-2' }, index: 2 } ],
			} );

			// Assert.
			expect( removeElements ).toHaveBeenCalledWith(
				expect.objectContaining( {
					elementIds: [ 'item-2' ],
				} )
			);
		} );

		it( 'should remove several items at once', () => {
			// Arrange.
			const { result } = renderHook( () => useActions() );

			// Act.
			result.current.removeItem( {
				items: [
					{ item: { id: 'item-0' }, index: 0 },
					{ item: { id: 'item-1' }, index: 1 },
				],
			} );

			// Assert.
			expect( removeElements ).toHaveBeenCalledWith(
				expect.objectContaining( {
					elementIds: [ 'item-0', 'item-1' ],
				} )
			);
		} );
	} );

	describe( 'duplicateItem', () => {
		it( 'should duplicate only the item element itself', () => {
			// Arrange.
			const { result } = renderHook( () => useActions() );

			// Act.
			result.current.duplicateItem( {
				items: [ { item: { id: 'item-1' }, index: 1 } ],
			} );

			// Assert.
			expect( duplicateElements ).toHaveBeenCalledWith(
				expect.objectContaining( {
					elementIds: [ 'item-1' ],
				} )
			);
		} );
	} );

	describe( 'moveItem', () => {
		it( 'should move the item within the accordion to the target index', () => {
			// Arrange.
			const { result } = renderHook( () => useActions() );

			// Act.
			result.current.moveItem( {
				accordionId: ACCORDION_ID,
				movedElementId: 'item-2',
				toIndex: 0,
			} );

			// Assert.
			expect( moveElements ).toHaveBeenCalledWith(
				expect.objectContaining( {
					moves: [
						{
							element: expect.objectContaining( { id: 'item-2' } ),
							targetContainer: expect.objectContaining( { id: ACCORDION_ID } ),
							options: { at: 0 },
						},
					],
				} )
			);
		} );

		it( 'should throw when the moved item is not found', () => {
			// Arrange.
			jest.mocked( getContainer ).mockImplementation( ( elementId: string ) =>
				elementId === ACCORDION_ID ? ( { id: elementId } as unknown as V1Element ) : null
			);

			const { result } = renderHook( () => useActions() );

			// Act & Assert.
			expect( () => {
				result.current.moveItem( {
					accordionId: ACCORDION_ID,
					movedElementId: 'missing',
					toIndex: 0,
				} );
			} ).toThrow( 'Accordion item or container not found' );
		} );
	} );
} );
