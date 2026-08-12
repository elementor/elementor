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
		const DEFAULT_TITLES = [ 'Accordion Item 1', 'Accordion Item 2' ];

		const addedTitles = () =>
			jest
				.mocked( createElements )
				.mock.calls.map(
					( [ { elements } ] ) => ( elements[ 0 ].model as unknown as V1ElementData ).editor_settings?.title
				);

		it( 'should create a single self-contained accordion item', () => {
			// Arrange.
			const { result } = renderHook( () => useActions() );

			// Act.
			result.current.addItem( {
				accordionId: ACCORDION_ID,
				existingTitles: DEFAULT_TITLES,
				items: [ { item: { id: '' }, index: 2 } ],
				showIcon: true,
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
				existingTitles: DEFAULT_TITLES,
				items: [
					{ item: { id: '' }, index: 2 },
					{ item: { id: '' }, index: 3 },
				],
				showIcon: true,
			} );

			// Assert.
			expect( createElements ).toHaveBeenCalledTimes( 2 );
			expect( addedTitles() ).toEqual( [ 'Accordion Item 3', 'Accordion Item 4' ] );
		} );

		it( 'should build the header/title/icon/content subtree of the added item', () => {
			// Arrange.
			const { result } = renderHook( () => useActions() );

			// Act.
			result.current.addItem( {
				accordionId: ACCORDION_ID,
				existingTitles: [],
				items: [ { item: { id: '' }, index: 0 } ],
				showIcon: true,
			} );

			// Assert.
			const model = getCreatedItemModel();
			const [ header, content ] = model.elements ?? [];
			const [ title, icon ] = header?.elements ?? [];

			expect( header.elType ).toBe( 'e-accordion-item-header' );
			expect( content.elType ).toBe( 'e-accordion-item-content' );
			expect( content.hydrateDefaultChildren ).toBe( true );
			expect( title.elType ).toBe( 'e-accordion-item-title' );
			expect( icon.elType ).toBe( 'e-accordion-item-icon' );
			expect( icon.hydrateDefaultChildren ).toBe( true );
			expect( header.settings ).toEqual( { show_icon: { $$type: 'boolean', value: true } } );
		} );

		it( "should seed the new item's header from the root's current show_icon value, not the schema default", () => {
			// Arrange.
			const { result } = renderHook( () => useActions() );

			// Act.
			result.current.addItem( {
				accordionId: ACCORDION_ID,
				existingTitles: [],
				items: [ { item: { id: '' }, index: 0 } ],
				showIcon: false,
			} );

			// Assert.
			const model = getCreatedItemModel();
			const [ header ] = model.elements ?? [];

			expect( header.settings ).toEqual( { show_icon: { $$type: 'boolean', value: false } } );
		} );

		it( 'should number the rendered title paragraph the same way the default tree does', () => {
			// Arrange.
			const { result } = renderHook( () => useActions() );

			// Act.
			result.current.addItem( {
				accordionId: ACCORDION_ID,
				existingTitles: DEFAULT_TITLES,
				items: [ { item: { id: '' }, index: 2 } ],
				showIcon: true,
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
				existingTitles: [],
				items: [ { item: { id: '' }, index: 0 } ],
				showIcon: true,
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
					existingTitles: [],
					items: [ { item: { id: '' }, index: 0 } ],
					showIcon: true,
				} );
			} ).toThrow( 'Accordion container not found' );
		} );
	} );

	describe( 'addItem numbering', () => {
		const addOne = ( existingTitles: ( string | undefined )[], index: number ) => {
			const { result } = renderHook( () => useActions() );

			result.current.addItem( {
				accordionId: ACCORDION_ID,
				existingTitles,
				items: [ { item: { id: '' }, index } ],
				showIcon: true,
			} );

			const model = jest.mocked( createElements ).mock.calls[ 0 ][ 0 ].elements[ 0 ]
				.model as unknown as V1ElementData;

			return {
				title: model.editor_settings?.title,
				paragraphContent: (
					model.elements?.[ 0 ].elements?.[ 0 ].elements?.[ 0 ].settings?.paragraph as {
						value: { content: { value: string } };
					}
				 ).value.content.value,
			};
		};

		it( 'should not reuse a surviving title after the first item was removed', () => {
			// Arrange.
			// The default pair minus "Accordion Item 1": one item left, so the Repeater reports index 1.
			const survivingTitles = [ 'Accordion Item 2' ];

			// Act.
			const { title, paragraphContent } = addOne( survivingTitles, 1 );

			// Assert.
			// Count-based numbering would have produced "Accordion Item 2" here - a duplicate of the
			// survivor, both in the Structure panel and on canvas.
			expect( title ).not.toBe( 'Accordion Item 2' );
			expect( survivingTitles ).not.toContain( title );
			expect( title ).toBe( 'Accordion Item 3' );
			expect( paragraphContent ).toBe( 'Accordion Item 3' );
		} );

		it( 'should not reuse a surviving title after a middle item was removed', () => {
			// Arrange.
			const survivingTitles = [ 'Accordion Item 1', 'Accordion Item 3' ];

			// Act.
			const { title } = addOne( survivingTitles, 2 );

			// Assert.
			expect( survivingTitles ).not.toContain( title );
			expect( title ).toBe( 'Accordion Item 4' );
		} );

		it( 'should never duplicate a visible title across a remove-then-add sequence', () => {
			// Arrange.
			let titles = [ 'Accordion Item 1', 'Accordion Item 2', 'Accordion Item 3' ];

			// Act.
			// Remove the first item, add, remove the first again, add - the sequence that breaks
			// count-based numbering twice over.
			titles = titles.slice( 1 );
			const first = addOne( titles, titles.length );
			titles = [ ...titles, first.title as string ].slice( 1 );

			jest.mocked( createElements ).mockClear();
			const second = addOne( titles, titles.length );

			// Assert.
			const finalTitles = [ ...titles, second.title as string ];

			expect( new Set( finalTitles ).size ).toBe( finalTitles.length );
		} );

		it( 'should number from 1 when no items remain', () => {
			// Act.
			const { title } = addOne( [], 0 );

			// Assert.
			expect( title ).toBe( 'Accordion Item 1' );
		} );

		it( 'should ignore renamed titles that carry no trailing number', () => {
			// Act.
			const { title } = addOne( [ 'Shipping', 'Returns' ], 2 );

			// Assert.
			expect( title ).toBe( 'Accordion Item 1' );
		} );

		it( 'should still avoid a collision when a user renamed an item onto the generated name', () => {
			// Arrange.
			// "Accordion Item 1" has no trailing number above it, so the max is 1 and the natural next
			// number is 2 - which the user has already taken by hand.
			const existingTitles = [ 'Accordion Item 1', 'Accordion Item 2' ];

			// Act.
			const { title } = addOne( existingTitles, 2 );

			// Assert.
			expect( existingTitles ).not.toContain( title );
			expect( title ).toBe( 'Accordion Item 3' );
		} );

		it( 'should give each item added in one action a distinct number', () => {
			// Arrange.
			const { result } = renderHook( () => useActions() );

			// Act.
			result.current.addItem( {
				accordionId: ACCORDION_ID,
				existingTitles: [ 'Accordion Item 2' ],
				items: [
					{ item: { id: '' }, index: 1 },
					{ item: { id: '' }, index: 2 },
				],
				showIcon: true,
			} );

			// Assert.
			const titles = jest
				.mocked( createElements )
				.mock.calls.map(
					( [ { elements } ] ) => ( elements[ 0 ].model as unknown as V1ElementData ).editor_settings?.title
				);

			expect( titles ).toEqual( [ 'Accordion Item 3', 'Accordion Item 4' ] );
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
