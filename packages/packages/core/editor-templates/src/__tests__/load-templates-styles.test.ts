import { createDOMElement, createMockStyleDefinition } from 'test-utils';
import { type Document, getV1CurrentDocument } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { ajax, getCanvasIframeDocument } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch } from '@elementor/store';

import { loadTemplatesStyles } from '../load-templates-styles';
import { slice } from '../store';
import { clearTemplatesStyles, templatesStylesProvider } from '../templates-styles-provider';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	getCanvasIframeDocument: jest.fn(),
	ajax: {
		load: jest.fn(),
	},
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	getV1CurrentDocument: jest.fn(),
} ) );

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__dispatch: jest.fn(),
} ) );

function createMockDocument( id: number, elements: V1ElementData[] = [] ): Document {
	return { id, elements } as unknown as Document;
}

function createMockElementData( overrides: Partial< V1ElementData > = {} ): V1ElementData {
	return {
		id: '1',
		elType: 'widget',
		widgetType: 'heading',
		settings: {},
		styles: {},
		elements: [],
		...overrides,
	} as V1ElementData;
}

function createTemplateElement( documentId: string ) {
	return createDOMElement( {
		tag: 'div',
		attrs: {
			'data-elementor-id': documentId,
			'data-elementor-post-type': 'elementor_library',
		},
	} );
}

describe( 'loadTemplatesStyles', () => {
	const mockLoad = jest.mocked( ajax.load );

	beforeEach( () => {
		jest.clearAllMocks();
		clearTemplatesStyles();

		jest.mocked( getV1CurrentDocument ).mockReturnValue( { id: 100 } as ReturnType< typeof getV1CurrentDocument > );
	} );

	it( 'should do nothing when iframe document is not available', async () => {
		// Arrange.
		jest.mocked( getCanvasIframeDocument ).mockReturnValue( null );

		// Act.
		await loadTemplatesStyles();

		// Assert.
		expect( templatesStylesProvider.actions.all() ).toEqual( [] );
		expect( mockLoad ).not.toHaveBeenCalled();
	} );

	it( 'should do nothing when no templates exist in canvas', async () => {
		// Arrange.
		const body = createDOMElement( {
			tag: 'body',
			children: [ createDOMElement( { tag: 'div', attrs: { 'data-elementor-id': '100' } } ) ],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );

		// Act.
		await loadTemplatesStyles();

		// Assert.
		expect( templatesStylesProvider.actions.all() ).toEqual( [] );
		expect( mockLoad ).not.toHaveBeenCalled();
	} );

	it( 'should load styles from templates in the canvas', async () => {
		// Arrange.
		const style1 = createMockStyleDefinition( { id: 'style-1' } );
		const style2 = createMockStyleDefinition( { id: 'style-2' } );

		const body = createDOMElement( {
			tag: 'body',
			children: [
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '100' },
				} ),
				createTemplateElement( '200' ),
				createTemplateElement( '300' ),
			],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );

		mockLoad.mockImplementation( ( params ) => {
			const { id } = params.data as { id: number };

			if ( id === 200 ) {
				return Promise.resolve(
					createMockDocument( 200, [ createMockElementData( { styles: { 'style-1': style1 } } ) ] )
				);
			}

			if ( id === 300 ) {
				return Promise.resolve(
					createMockDocument( 300, [ createMockElementData( { styles: { 'style-2': style2 } } ) ] )
				);
			}

			return Promise.reject( new Error( 'Not found' ) );
		} );

		// Act.
		await loadTemplatesStyles();

		// Assert.
		expect( mockLoad ).toHaveBeenCalledTimes( 2 );
		expect( mockLoad ).toHaveBeenCalledWith(
			expect.objectContaining( { data: { id: 200 }, action: 'get_document_config' } )
		);
		expect( mockLoad ).toHaveBeenCalledWith(
			expect.objectContaining( { data: { id: 300 }, action: 'get_document_config' } )
		);

		const styles = templatesStylesProvider.actions.all();
		expect( styles ).toHaveLength( 2 );
		expect( styles ).toContainEqual( style1 );
		expect( styles ).toContainEqual( style2 );
	} );

	it( 'should only discover elements with library post type', async () => {
		// Arrange.
		const body = createDOMElement( {
			tag: 'body',
			children: [
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '100' },
				} ),
				createTemplateElement( '200' ),
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '500', 'data-elementor-type': 'wp-post' },
				} ),
			],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );
		mockLoad.mockResolvedValue( createMockDocument( 200, [] ) );

		// Act.
		await loadTemplatesStyles();

		// Assert.
		expect( mockLoad ).toHaveBeenCalledTimes( 1 );
		expect( mockLoad ).toHaveBeenCalledWith( expect.objectContaining( { data: { id: 200 } } ) );
		expect( mockLoad ).not.toHaveBeenCalledWith( expect.objectContaining( { data: { id: 500 } } ) );
	} );

	it( 'should extract styles from nested elements', async () => {
		// Arrange.
		const parentStyle = createMockStyleDefinition( { id: 'parent-style' } );
		const childStyle = createMockStyleDefinition( { id: 'child-style' } );

		const body = createDOMElement( {
			tag: 'body',
			children: [
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '100' },
				} ),
				createTemplateElement( '200' ),
			],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );

		mockLoad.mockResolvedValue(
			createMockDocument( 200, [
				createMockElementData( {
					styles: { 'parent-style': parentStyle },
					elements: [
						createMockElementData( {
							id: '2',
							styles: { 'child-style': childStyle },
						} ),
					],
				} ),
			] )
		);

		// Act.
		await loadTemplatesStyles();

		// Assert.
		const styles = templatesStylesProvider.actions.all();
		expect( styles ).toHaveLength( 2 );
		expect( styles ).toContainEqual( parentStyle );
		expect( styles ).toContainEqual( childStyle );
	} );

	it( 'should dispatch setTemplates with fetched documents', async () => {
		// Arrange.
		const document200 = createMockDocument( 200, [
			createMockElementData( { styles: { s: createMockStyleDefinition( { id: 's' } ) } } ),
		] );

		const body = createDOMElement( {
			tag: 'body',
			children: [
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '100' },
				} ),
				createTemplateElement( '200' ),
			],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );
		mockLoad.mockResolvedValue( document200 );

		// Act.
		await loadTemplatesStyles();

		// Assert.
		expect( dispatch ).toHaveBeenCalledWith( slice.actions.setTemplates( [ document200 ] ) );
	} );

	it( 'should gracefully handle failed document requests', async () => {
		// Arrange.
		const style1 = createMockStyleDefinition( { id: 'style-1' } );

		const body = createDOMElement( {
			tag: 'body',
			children: [
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '100' },
				} ),
				createTemplateElement( '200' ),
				createTemplateElement( '300' ),
			],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );

		mockLoad.mockImplementation( ( params ) => {
			const { id } = params.data as { id: number };

			if ( id === 200 ) {
				return Promise.resolve(
					createMockDocument( 200, [ createMockElementData( { styles: { 'style-1': style1 } } ) ] )
				);
			}

			return Promise.reject( new Error( 'Not found' ) );
		} );

		// Act.
		await loadTemplatesStyles();

		// Assert.
		const styles = templatesStylesProvider.actions.all();
		expect( styles ).toHaveLength( 1 );
		expect( styles ).toContainEqual( style1 );
	} );

	it( 'should deduplicate document IDs', async () => {
		// Arrange.
		const body = createDOMElement( {
			tag: 'body',
			children: [
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '100' },
				} ),
				createTemplateElement( '200' ),
				createTemplateElement( '200' ),
			],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );
		mockLoad.mockResolvedValue( createMockDocument( 200, [] ) );

		// Act.
		await loadTemplatesStyles();

		// Assert.
		expect( mockLoad ).toHaveBeenCalledTimes( 1 );
	} );
} );
