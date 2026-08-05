import { createMockDocument } from 'test-utils';

import { apiClient } from '../../api';
import { getComponentDocumentData } from '../component-document-data';

jest.mock( '../../api', () => ( {
	apiClient: {
		getComponentConfig: jest.fn(),
	},
} ) );

describe( 'getComponentDocumentData', () => {
	const mockGetComponentConfig = jest.mocked( apiClient.getComponentConfig );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should fetch the component config through the batched ajax api', async () => {
		// Arrange
		const componentId = 123;
		const mockDocument = createMockDocument( { id: componentId } );
		mockGetComponentConfig.mockResolvedValueOnce( mockDocument );

		// Act
		const result = await getComponentDocumentData( componentId );

		// Assert
		expect( mockGetComponentConfig ).toHaveBeenCalledWith( componentId );
		expect( result ).toBe( mockDocument );
	} );

	it( 'should return null when the fetch fails', async () => {
		// Arrange
		mockGetComponentConfig.mockRejectedValueOnce( new Error( 'Not found' ) );

		// Act
		const result = await getComponentDocumentData( 456 );

		// Assert
		expect( result ).toBeNull();
	} );
} );
