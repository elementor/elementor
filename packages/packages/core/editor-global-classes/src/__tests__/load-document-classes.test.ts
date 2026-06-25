import { apiClient } from '../api';
import { addDocumentClasses } from '../load-document-classes';

jest.mock( '../api', () => ( {
	apiClient: {
		all: jest.fn(),
		getStylesForPost: jest.fn(),
	},
} ) );

describe( 'addDocumentClasses', () => {
	const mockGetStylesForPost = jest.mocked( apiClient.getStylesForPost );

	beforeEach( () => {
		jest.clearAllMocks();
		mockGetStylesForPost.mockResolvedValue( { data: { data: {} } } as never );
	} );

	it( 'should fetch preview and frontend classes for a document', async () => {
		await addDocumentClasses( 99 );

		expect( mockGetStylesForPost ).toHaveBeenCalledWith( 99, 'preview' );
		expect( mockGetStylesForPost ).toHaveBeenCalledWith( 99, 'frontend' );
	} );
} );
