import { createMockDocument, createMockStyleDefinition } from 'test-utils';

import { embeddedDocumentsManager, setCurrentDocumentId } from '../manager';

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
		embeddedDocumentsManager.reset();
	} );

	it( 'should expose the static key', () => {
		expect( __getProvider().getKey() ).toBe( 'embedded-documents-styles' );
	} );

	it( 'should return an empty array before any documents are loaded', () => {
		expect( __getProvider().actions.all() ).toEqual( [] );
	} );

	it( 'should return null for get() before any documents are loaded', () => {
		expect( __getProvider().actions.get( 'any-id' ) ).toBeNull();
	} );

	it( 'should accumulate styles when a document is announced', () => {
		// Arrange.
		const style1 = createMockStyleDefinition( { id: 's-1' } );
		const style2 = createMockStyleDefinition( { id: 's-2' } );

		// Act.
		embeddedDocumentsManager.setDocument( 10, makeDocWithStyle( 10, 's-1', style1, 's-2', style2 ) );

		// Assert.
		expect( __getProvider().actions.all() ).toEqual( [ style1, style2 ] );
	} );

	it( 'should extract styles from nested elements', () => {
		// Arrange.
		const parentStyle = createMockStyleDefinition( { id: 'parent-style' } );
		const childStyle = createMockStyleDefinition( { id: 'child-style' } );

		// Act.
		embeddedDocumentsManager.setDocument(
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
		embeddedDocumentsManager.setDocument( 20, makeDocWithStyle( 20, 's-1', style1, 's-2', style2 ) );

		// Act & Assert.
		expect( __getProvider().actions.get( 's-1' ) ).toStrictEqual( style1 );
		expect( __getProvider().actions.get( 's-2' ) ).toStrictEqual( style2 );
	} );

	it( 'should return null for an unknown style id', () => {
		// Arrange.
		embeddedDocumentsManager.setDocument(
			21,
			makeDocWithStyle( 21, 's-1', createMockStyleDefinition( { id: 's-1' } ) )
		);

		// Act & Assert.
		expect( __getProvider().actions.get( 'non-existent' ) ).toBeNull();
	} );

	it( 'should accumulate styles across multiple documents', () => {
		// Arrange.
		const style1 = createMockStyleDefinition( { id: 's-1' } );
		const style2 = createMockStyleDefinition( { id: 's-2' } );

		// Act.
		embeddedDocumentsManager.setDocument( 30, makeDocWithStyle( 30, 's-1', style1 ) );
		embeddedDocumentsManager.setDocument( 31, makeDocWithStyle( 31, 's-2', style2 ) );

		// Assert.
		expect( __getProvider().actions.all() ).toEqual( [ style1, style2 ] );
	} );

	it( 'should skip documents with no elements', () => {
		// Act.
		embeddedDocumentsManager.setDocument( 40, createMockDocument( { id: 40 } ) );

		// Assert.
		expect( __getProvider().actions.all() ).toEqual( [] );
	} );

	it( 'should notify subscribers when a document with styles is announced', () => {
		// Arrange.
		const callback = jest.fn();
		__getProvider().subscribe( callback );

		// Act.
		embeddedDocumentsManager.setDocument(
			50,
			makeDocWithStyle( 50, 's-1', createMockStyleDefinition( { id: 's-1' } ) )
		);

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not notify subscribers for documents with no styles', () => {
		// Arrange.
		const callback = jest.fn();
		__getProvider().subscribe( callback );

		// Act.
		embeddedDocumentsManager.setDocument( 51, createMockDocument( { id: 51 } ) );

		// Assert.
		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'should clear all styles and notify subscribers on reset()', () => {
		// Arrange.
		embeddedDocumentsManager.setDocument(
			70,
			makeDocWithStyle( 70, 's-1', createMockStyleDefinition( { id: 's-1' } ) )
		);

		const callback = jest.fn();
		__getProvider().subscribe( callback );

		// Act.
		embeddedDocumentsManager.reset();

		// Assert.
		expect( __getProvider().actions.all() ).toEqual( [] );
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not re-notify onDocumentLoad listeners when the same document is announced again', () => {
		// Arrange.
		const callback = jest.fn();
		embeddedDocumentsManager.onDocumentLoad( callback );

		const doc = makeDocWithStyle( 80, 's-1', createMockStyleDefinition( { id: 's-1' } ) );

		// Act.
		embeddedDocumentsManager.setDocument( 80, doc );
		embeddedDocumentsManager.setDocument( 80, doc );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not notify onDocumentLoad listeners for the current document', () => {
		// Arrange.
		const callback = jest.fn();
		setCurrentDocumentId( 90 );
		embeddedDocumentsManager.onDocumentLoad( callback );

		// Act.
		embeddedDocumentsManager.setDocument(
			90,
			makeDocWithStyle( 90, 's-1', createMockStyleDefinition( { id: 's-1' } ) )
		);

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
		embeddedDocumentsManager.setDocument(
			60,
			makeDocWithStyle( 60, 's-1', createMockStyleDefinition( { id: 's-1' } ) )
		);

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
