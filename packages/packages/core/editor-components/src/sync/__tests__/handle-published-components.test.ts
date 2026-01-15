import { invalidateComponentDocumentData } from '../../utils/component-document-data';
import { handlePublishedComponents } from '../handle-published-components';

jest.mock( '../../utils/component-document-data' );

const mockInvalidateComponentDocumentData = jest.mocked( invalidateComponentDocumentData );

describe( 'handlePublishedComponents', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should invalidate component data for all successfully published components', () => {
		// Arrange
		const result = {
			successIds: [ 1000, 2000, 3000 ],
			failed: [],
		};

		// Act
		handlePublishedComponents( result );

		// Assert
		expect( mockInvalidateComponentDocumentData ).toHaveBeenCalledTimes( 3 );
		expect( mockInvalidateComponentDocumentData ).toHaveBeenNthCalledWith( 1, 1000 );
		expect( mockInvalidateComponentDocumentData ).toHaveBeenNthCalledWith( 2, 2000 );
		expect( mockInvalidateComponentDocumentData ).toHaveBeenNthCalledWith( 3, 3000 );
	} );

	it( 'should not invalidate failed components', () => {
		// Arrange
		const result = {
			successIds: [ 1000 ],
			failed: [
				{ id: 2000, error: 'Failed to publish' },
				{ id: 3000, error: 'Component not found' },
			],
		};

		// Act
		handlePublishedComponents( result );

		// Assert
		expect( mockInvalidateComponentDocumentData ).toHaveBeenCalledTimes( 1 );
		expect( mockInvalidateComponentDocumentData ).toHaveBeenCalledWith( 1000 );
	} );

	it( 'should handle empty success array', () => {
		// Arrange
		const result = {
			successIds: [],
			failed: [ { id: 1000, error: 'Component not found' } ],
		};

		// Act
		handlePublishedComponents( result );

		// Assert
		expect( mockInvalidateComponentDocumentData ).not.toHaveBeenCalled();
	} );

	it( 'should handle all components being successful', () => {
		// Arrange
		const result = {
			successIds: [ 1000, 2000 ],
			failed: [],
		};

		// Act
		handlePublishedComponents( result );

		// Assert
		expect( mockInvalidateComponentDocumentData ).toHaveBeenCalledTimes( 2 );
	} );
} );
