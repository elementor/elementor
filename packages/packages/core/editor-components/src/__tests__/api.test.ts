import { getParams } from '../api';

const V1_DOCUMENTS_MANAGER_UNIQUE_ID = ( id: number ) => `document-${ id }`;

describe( 'getParams', () => {
	it( 'should share the ajax cache key with the v1 documents manager', () => {
		// Arrange
		const componentId = 123;

		// Act
		const params = getParams( componentId );

		// Assert
		expect( params.unique_id ).toBe( V1_DOCUMENTS_MANAGER_UNIQUE_ID( componentId ) );
		expect( params.data ).toEqual( { id: componentId } );
	} );
} );
