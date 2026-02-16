import { createDOMElement } from 'test-utils';
import { type Document, getV1CurrentDocument } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { ajax, getCanvasIframeDocument } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch } from '@elementor/store';

import { loadTemplates, unloadTemplates } from '../load-templates';
import { slice } from '../store';

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

function createTemplateElement( documentId: string ) {
	return createDOMElement( {
		tag: 'div',
		attrs: {
			'data-elementor-id': documentId,
			'data-elementor-post-type': 'elementor_library',
		},
	} );
}

describe( 'loadTemplates', () => {
	const mockLoad = jest.mocked( ajax.load );

	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( getV1CurrentDocument ).mockReturnValue( { id: 100 } as ReturnType< typeof getV1CurrentDocument > );
	} );

	it( 'should do nothing when iframe document is not available', async () => {
		// Arrange.
		jest.mocked( getCanvasIframeDocument ).mockReturnValue( null );

		// Act.
		await loadTemplates();

		// Assert.
		expect( mockLoad ).not.toHaveBeenCalled();
		expect( dispatch ).not.toHaveBeenCalled();
	} );

	it( 'should do nothing when no templates exist in canvas', async () => {
		// Arrange.
		const body = createDOMElement( {
			tag: 'body',
			children: [ createDOMElement( { tag: 'div', attrs: { 'data-elementor-id': '100' } } ) ],
		} );

		jest.mocked( getCanvasIframeDocument ).mockReturnValue( { body } as unknown as globalThis.Document );

		// Act.
		await loadTemplates();

		// Assert.
		expect( mockLoad ).not.toHaveBeenCalled();
		expect( dispatch ).not.toHaveBeenCalled();
	} );

	it( 'should fetch documents and dispatch setTemplates', async () => {
		// Arrange.
		const document200 = createMockDocument( 200 );
		const document300 = createMockDocument( 300 );

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
				return Promise.resolve( document200 );
			}

			if ( id === 300 ) {
				return Promise.resolve( document300 );
			}

			return Promise.reject( new Error( 'Not found' ) );
		} );

		// Act.
		await loadTemplates();

		// Assert.
		expect( mockLoad ).toHaveBeenCalledTimes( 2 );
		expect( mockLoad ).toHaveBeenCalledWith(
			expect.objectContaining( { data: { id: 200 }, action: 'get_document_config' } )
		);
		expect( mockLoad ).toHaveBeenCalledWith(
			expect.objectContaining( { data: { id: 300 }, action: 'get_document_config' } )
		);
		expect( dispatch ).toHaveBeenCalledWith( slice.actions.setTemplates( [ document200, document300 ] ) );
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
		mockLoad.mockResolvedValue( createMockDocument( 200 ) );

		// Act.
		await loadTemplates();

		// Assert.
		expect( mockLoad ).toHaveBeenCalledTimes( 1 );
		expect( mockLoad ).toHaveBeenCalledWith( expect.objectContaining( { data: { id: 200 } } ) );
		expect( mockLoad ).not.toHaveBeenCalledWith( expect.objectContaining( { data: { id: 500 } } ) );
	} );

	it( 'should gracefully handle failed document requests', async () => {
		// Arrange.
		const document200 = createMockDocument( 200 );

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
				return Promise.resolve( document200 );
			}

			return Promise.reject( new Error( 'Not found' ) );
		} );

		// Act.
		await loadTemplates();

		// Assert.
		expect( dispatch ).toHaveBeenCalledWith( slice.actions.setTemplates( [ document200 ] ) );
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
		mockLoad.mockResolvedValue( createMockDocument( 200 ) );

		// Act.
		await loadTemplates();

		// Assert.
		expect( mockLoad ).toHaveBeenCalledTimes( 1 );
	} );
} );

describe( 'unloadTemplates', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should dispatch clearTemplates', () => {
		// Act.
		unloadTemplates();

		// Assert.
		expect( dispatch ).toHaveBeenCalledWith( slice.actions.clearTemplates() );
	} );
} );
