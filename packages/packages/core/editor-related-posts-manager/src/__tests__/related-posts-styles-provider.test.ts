import { createMockDocument, createMockStyleDefinition } from 'test-utils';

import { onPostLoad, reset, setCurrentDocumentId, setPost } from '../api';

jest.mock( '@elementor/editor-styles-repository', () => {
	let capturedConfig: {
		subscribe: ( cb: () => void ) => () => void;
		actions: {
			all: () => unknown[];
			get: ( id: string ) => unknown;
		};
		getKey: () => string;
	} | null = null;

	return {
		createStylesProvider: jest.fn( ( config ) => {
			capturedConfig = {
				getKey: () => config.key,
				subscribe: config.subscribe,
				actions: config.actions,
			};

			return capturedConfig;
		} ),
		stylesRepository: {
			register: jest.fn(),
		},
		__getProvider: () => capturedConfig,
	};
} );

const { __getProvider } = require( '@elementor/editor-styles-repository' );

describe( 'styles-provider', () => {
	afterEach( () => {
		setCurrentDocumentId( null );
		reset();
	} );

	it( 'should expose the static key', () => {
		expect( __getProvider().getKey() ).toBe( 'related-posts-styles' );
	} );

	it( 'should return an empty array before any posts are loaded', () => {
		expect( __getProvider().actions.all() ).toEqual( [] );
	} );

	it( 'should return null for get() before any posts are loaded', () => {
		expect( __getProvider().actions.get( 'any-id' ) ).toBeNull();
	} );

	it( 'should accumulate styles when a post is announced', () => {
		// Arrange.
		const style1 = createMockStyleDefinition( { id: 's-1' } );
		const style2 = createMockStyleDefinition( { id: 's-2' } );

		// Act.
		setPost( 10, makeDocWithStyle( 10, 's-1', style1, 's-2', style2 ) );

		// Assert.
		expect( __getProvider().actions.all() ).toEqual( [ style1, style2 ] );
	} );

	it( 'should extract styles from nested elements', () => {
		// Arrange.
		const parentStyle = createMockStyleDefinition( { id: 'parent-style' } );
		const childStyle = createMockStyleDefinition( { id: 'child-style' } );

		// Act.
		setPost(
			11,
			createMockDocument( {
				id: 11,
				elements: [
					{
						id: 'el-parent',
						elType: 'section',
						widgetType: undefined,
						settings: {},
						styles: { 'parent-style': parentStyle },
						elements: [
							{
								id: 'el-child',
								elType: 'widget',
								widgetType: 'heading',
								settings: {},
								styles: { 'child-style': childStyle },
								elements: [],
							},
						],
					},
				],
			} )
		);

		// Assert.
		expect( __getProvider().actions.all() ).toEqual( [ parentStyle, childStyle ] );
	} );

	it( 'should retrieve a single style by id via get()', () => {
		// Arrange.
		const style1 = createMockStyleDefinition( { id: 's-1' } );
		const style2 = createMockStyleDefinition( { id: 's-2' } );
		setPost( 20, makeDocWithStyle( 20, 's-1', style1, 's-2', style2 ) );

		// Act & Assert.
		expect( __getProvider().actions.get( 's-1' ) ).toStrictEqual( style1 );
		expect( __getProvider().actions.get( 's-2' ) ).toStrictEqual( style2 );
	} );

	it( 'should return null for an unknown style id', () => {
		// Arrange.
		setPost( 21, makeDocWithStyle( 21, 's-1', createMockStyleDefinition( { id: 's-1' } ) ) );

		// Act & Assert.
		expect( __getProvider().actions.get( 'non-existent' ) ).toBeNull();
	} );

	it( 'should accumulate styles across multiple posts', () => {
		// Arrange.
		const style1 = createMockStyleDefinition( { id: 's-1' } );
		const style2 = createMockStyleDefinition( { id: 's-2' } );

		// Act.
		setPost( 30, makeDocWithStyle( 30, 's-1', style1 ) );
		setPost( 31, makeDocWithStyle( 31, 's-2', style2 ) );

		// Assert.
		expect( __getProvider().actions.all() ).toEqual( [ style1, style2 ] );
	} );

	it( 'should skip posts with no elements', () => {
		// Act.
		setPost( 40, createMockDocument( { id: 40 } ) );

		// Assert.
		expect( __getProvider().actions.all() ).toEqual( [] );
	} );

	it( 'should notify subscribers when a post with styles is announced', () => {
		// Arrange.
		const callback = jest.fn();
		__getProvider().subscribe( callback );

		// Act.
		setPost( 50, makeDocWithStyle( 50, 's-1', createMockStyleDefinition( { id: 's-1' } ) ) );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not notify subscribers for posts with no styles', () => {
		// Arrange.
		const callback = jest.fn();
		__getProvider().subscribe( callback );

		// Act.
		setPost( 51, createMockDocument( { id: 51 } ) );

		// Assert.
		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'should clear all styles and notify subscribers on reset()', () => {
		// Arrange.
		setPost( 70, makeDocWithStyle( 70, 's-1', createMockStyleDefinition( { id: 's-1' } ) ) );

		const callback = jest.fn();
		__getProvider().subscribe( callback );

		// Act.
		reset();

		// Assert.
		expect( __getProvider().actions.all() ).toEqual( [] );
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not re-notify onPostLoad listeners when the same post is announced again', () => {
		// Arrange.
		const callback = jest.fn();
		onPostLoad( callback );

		const doc = makeDocWithStyle( 80, 's-1', createMockStyleDefinition( { id: 's-1' } ) );

		// Act.
		setPost( 80, doc );
		setPost( 80, doc );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not notify onPostLoad listeners for the current document', () => {
		// Arrange.
		const callback = jest.fn();
		setCurrentDocumentId( 90 );
		onPostLoad( callback );

		// Act.
		setPost( 90, makeDocWithStyle( 90, 's-1', createMockStyleDefinition( { id: 's-1' } ) ) );

		// Assert.
		expect( callback ).not.toHaveBeenCalled();
		expect( __getProvider().actions.all() ).toEqual( [] );
	} );

	it( 'should stop notifying after provider unsubscribe', () => {
		// Arrange.
		const callback = jest.fn();
		const unsubscribe = __getProvider().subscribe( callback );

		// Act.
		unsubscribe();
		setPost( 60, makeDocWithStyle( 60, 's-1', createMockStyleDefinition( { id: 's-1' } ) ) );

		// Assert.
		expect( callback ).not.toHaveBeenCalled();
	} );
} );

type StyleDef = ReturnType< typeof createMockStyleDefinition >;

function makeDocWithStyle( id: number, ...pairs: [ string, StyleDef, ...( string | StyleDef )[] ] ) {
	const styles: Record< string, StyleDef > = {};

	for ( let i = 0; i < pairs.length; i += 2 ) {
		styles[ pairs[ i ] as string ] = pairs[ i + 1 ] as StyleDef;
	}

	return createMockDocument( {
		id,
		elements: [
			{
				id: `el-${ id }`,
				elType: 'widget',
				widgetType: 'text-editor',
				settings: {},
				styles,
				elements: [],
			},
		],
	} );
}
