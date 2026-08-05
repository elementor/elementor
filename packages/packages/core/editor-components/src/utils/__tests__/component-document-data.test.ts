import { createMockDocumentData } from 'test-utils';

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

	it( 'should fetch component document config via batched ajax.load', async () => {
		// Arrange
		const componentId = 123;
		const mockDocument = createMockDocumentData( { id: componentId } );
		mockGetComponentConfig.mockResolvedValueOnce( mockDocument );

		// Act
		const result = await getComponentDocumentData( componentId );

		// Assert
		expect( mockGetComponentConfig ).toHaveBeenCalledWith( componentId );
		expect( result ).toBe( mockDocument );
	} );

	it( 'should return null when fetch fails', async () => {
		// Arrange
		mockGetComponentConfig.mockRejectedValueOnce( new Error( 'Not found' ) );

		// Act
		const result = await getComponentDocumentData( 456 );

		// Assert
		expect( result ).toBeNull();
	} );
} );
