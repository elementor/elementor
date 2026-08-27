import { createMockDocument } from 'test-utils';
import { ajax } from '@elementor/editor-v1-adapters';

import { getComponentDocumentData } from '../component-document-data';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	ajax: {
		load: jest.fn(),
	},
} ) );

describe( 'getComponentDocumentData', () => {
	const mockLoad = jest.mocked( ajax.load );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should request the config through the batched ajax api, on the v1 documents manager cache key', async () => {
		// Arrange
		const componentId = 123;
		const mockDocument = createMockDocument( { id: componentId } );

		mockLoad.mockResolvedValueOnce( mockDocument );

		// Act
		const result = await getComponentDocumentData( componentId );

		// Assert
		expect( mockLoad ).toHaveBeenCalledWith( {
			action: 'get_document_config',
			unique_id: `document-${ componentId }`,
			data: { id: componentId },
		} );
		expect( result ).toBe( mockDocument );
	} );

	it( 'should return null when the request fails', async () => {
		// Arrange
		mockLoad.mockRejectedValueOnce( new Error( 'Not found' ) );

		// Act
		const result = await getComponentDocumentData( 456 );

		// Assert
		expect( result ).toBeNull();
	} );

	it( 'should dedupe concurrent requests for the same component', async () => {
		// Arrange
		const componentId = 789;
		const mockDocument = createMockDocument( { id: componentId } );

		mockLoad.mockResolvedValue( mockDocument );

		// Act
		const results = await Promise.all( [
			getComponentDocumentData( componentId ),
			getComponentDocumentData( componentId ),
		] );

		// Assert
		expect( mockLoad ).toHaveBeenCalledTimes( 1 );
		expect( results ).toEqual( [ mockDocument, mockDocument ] );
	} );

	it( 'should request again after the previous request settled', async () => {
		// Arrange
		const componentId = 789;
		const mockDocument = createMockDocument( { id: componentId } );

		mockLoad.mockResolvedValue( mockDocument );

		// Act
		await getComponentDocumentData( componentId );
		await getComponentDocumentData( componentId );

		// Assert
		expect( mockLoad ).toHaveBeenCalledTimes( 2 );
	} );
} );
