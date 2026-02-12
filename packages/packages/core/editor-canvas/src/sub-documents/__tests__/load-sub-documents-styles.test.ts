import { createDOMElement, createMockStyleDefinition } from 'test-utils';
import { type Document, getV1CurrentDocument, getV1DocumentsManager } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { getCanvasIframeDocument } from '@elementor/editor-v1-adapters';

import { loadSubDocumentsStyles } from '../load-sub-documents-styles';
import { clearSubDocumentStyles, subDocumentsStylesProvider } from '../sub-documents-styles-provider';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	getCanvasIframeDocument: jest.fn(),
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	getV1CurrentDocument: jest.fn(),
	getV1DocumentsManager: jest.fn(),
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

describe( 'loadSubDocumentsStyles', () => {
	const mockRequest = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		clearSubDocumentStyles();

		jest.mocked( getV1CurrentDocument ).mockReturnValue( { id: 100 } as ReturnType< typeof getV1CurrentDocument > );
		jest.mocked( getV1DocumentsManager ).mockReturnValue( { request: mockRequest } as unknown as ReturnType<
			typeof getV1DocumentsManager
		> );
	} );

	it( 'should do nothing when iframe document is not available', async () => {
		// Arrange.
		jest.mocked( getCanvasIframeDocument ).mockReturnValue( null );

		// Act.
		await loadSubDocumentsStyles();

		// Assert.
		expect( subDocumentsStylesProvider.actions.all() ).toEqual( [] );
		expect( mockRequest ).not.toHaveBeenCalled();
	} );

	it( 'should do nothing when no sub-documents exist in canvas', async () => {
		// Arrange.
		const body = createDOMElement( {
			tag: 'body',
			children: [ createDOMElement( { tag: 'div', attrs: { 'data-elementor-id': '100' } } ) ],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );

		// Act.
		await loadSubDocumentsStyles();

		// Assert.
		expect( subDocumentsStylesProvider.actions.all() ).toEqual( [] );
		expect( mockRequest ).not.toHaveBeenCalled();
	} );

	it( 'should load styles from sub-documents in the canvas', async () => {
		// Arrange.
		const style1 = createMockStyleDefinition( { id: 'style-1' } );
		const style2 = createMockStyleDefinition( { id: 'style-2' } );

		const body = createDOMElement( {
			tag: 'body',
			children: [
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '100', 'data-elementor-type': 'page' },
				} ),
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '200', 'data-elementor-type': 'header' },
				} ),
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '300', 'data-elementor-type': 'footer' },
				} ),
			],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );

		mockRequest.mockImplementation( ( id: number ) => {
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
		await loadSubDocumentsStyles();

		// Assert.
		expect( mockRequest ).toHaveBeenCalledTimes( 2 );
		expect( mockRequest ).toHaveBeenCalledWith( 200 );
		expect( mockRequest ).toHaveBeenCalledWith( 300 );

		const styles = subDocumentsStylesProvider.actions.all();
		expect( styles ).toHaveLength( 2 );
		expect( styles ).toContainEqual( style1 );
		expect( styles ).toContainEqual( style2 );
	} );

	it( 'should exclude component documents from sub-document discovery', async () => {
		// Arrange.
		const body = createDOMElement( {
			tag: 'body',
			children: [
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '100', 'data-elementor-type': 'page' },
				} ),
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '200', 'data-elementor-type': 'header' },
				} ),
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '500', 'data-elementor-type': 'elementor_component' },
				} ),
			],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );
		mockRequest.mockResolvedValue( createMockDocument( 200, [] ) );

		// Act.
		await loadSubDocumentsStyles();

		// Assert.
		expect( mockRequest ).toHaveBeenCalledTimes( 1 );
		expect( mockRequest ).toHaveBeenCalledWith( 200 );
		expect( mockRequest ).not.toHaveBeenCalledWith( 500 );
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
					attrs: { 'data-elementor-id': '100', 'data-elementor-type': 'page' },
				} ),
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '200', 'data-elementor-type': 'header' },
				} ),
			],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );

		mockRequest.mockResolvedValue(
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
		await loadSubDocumentsStyles();

		// Assert.
		const styles = subDocumentsStylesProvider.actions.all();
		expect( styles ).toHaveLength( 2 );
		expect( styles ).toContainEqual( parentStyle );
		expect( styles ).toContainEqual( childStyle );
	} );

	it( 'should also load styles from component instances inside sub-documents', async () => {
		// Arrange.
		const headerStyle = createMockStyleDefinition( { id: 'header-style' } );
		const componentStyle = createMockStyleDefinition( { id: 'component-style' } );

		const body = createDOMElement( {
			tag: 'body',
			children: [
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '100', 'data-elementor-type': 'page' },
				} ),
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '200', 'data-elementor-type': 'header' },
				} ),
			],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );

		mockRequest.mockImplementation( ( id: number ) => {
			if ( id === 200 ) {
				return Promise.resolve(
					createMockDocument( 200, [
						createMockElementData( {
							styles: { 'header-style': headerStyle },
						} ),
						createMockElementData( {
							widgetType: 'e-component',
							settings: {
								component_instance: {
									value: { component_id: { value: 999 } },
								},
							},
						} ),
					] )
				);
			}

			if ( id === 999 ) {
				return Promise.resolve(
					createMockDocument( 999, [
						createMockElementData( {
							styles: { 'component-style': componentStyle },
						} ),
					] )
				);
			}

			return Promise.reject( new Error( 'Not found' ) );
		} );

		// Act.
		await loadSubDocumentsStyles();

		// Assert.
		expect( mockRequest ).toHaveBeenCalledWith( 200 );
		expect( mockRequest ).toHaveBeenCalledWith( 999 );

		const styles = subDocumentsStylesProvider.actions.all();
		expect( styles ).toHaveLength( 2 );
		expect( styles ).toContainEqual( headerStyle );
		expect( styles ).toContainEqual( componentStyle );
	} );

	it( 'should gracefully handle failed document requests', async () => {
		// Arrange.
		const style1 = createMockStyleDefinition( { id: 'style-1' } );

		const body = createDOMElement( {
			tag: 'body',
			children: [
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '100', 'data-elementor-type': 'page' },
				} ),
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '200', 'data-elementor-type': 'header' },
				} ),
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '300', 'data-elementor-type': 'footer' },
				} ),
			],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );

		mockRequest.mockImplementation( ( id: number ) => {
			if ( id === 200 ) {
				return Promise.resolve(
					createMockDocument( 200, [ createMockElementData( { styles: { 'style-1': style1 } } ) ] )
				);
			}

			return Promise.reject( new Error( 'Not found' ) );
		} );

		// Act.
		await loadSubDocumentsStyles();

		// Assert.
		const styles = subDocumentsStylesProvider.actions.all();
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
					attrs: { 'data-elementor-id': '100', 'data-elementor-type': 'page' },
				} ),
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '200', 'data-elementor-type': 'header' },
				} ),
				createDOMElement( {
					tag: 'div',
					attrs: { 'data-elementor-id': '200', 'data-elementor-type': 'header' },
				} ),
			],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );
		mockRequest.mockResolvedValue( createMockDocument( 200, [] ) );

		// Act.
		await loadSubDocumentsStyles();

		// Assert.
		expect( mockRequest ).toHaveBeenCalledTimes( 1 );
	} );
} );
