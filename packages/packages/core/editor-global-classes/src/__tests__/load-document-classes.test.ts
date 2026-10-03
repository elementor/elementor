import { getV1CurrentDocument } from '@elementor/editor-documents';

import { apiClient } from '../api';
import { addDocumentClasses, loadCurrentDocumentClasses } from '../load-document-classes';

jest.mock( '@elementor/editor-documents' );

jest.mock( '../api', () => ( {
	apiClient: {
		all: jest.fn(),
		getStylesForPost: jest.fn(),
	},
} ) );

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__dispatch: jest.fn(),
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

describe( 'loadCurrentDocumentClasses', () => {
	const mockAll = jest.mocked( apiClient.all );
	const mockGetStylesForPost = jest.mocked( apiClient.getStylesForPost );
	const mockGetV1CurrentDocument = jest.mocked( getV1CurrentDocument );

	beforeEach( () => {
		jest.clearAllMocks();
		mockAll.mockResolvedValue( { data: { data: [] } } as never );
		mockGetStylesForPost.mockResolvedValue( { data: { data: {} } } as never );
	} );

	it( 'reads the current document from the V1 documents manager (fresh at attach-preview time)', async () => {
		// Arrange - V1 already reflects the new doc during attach-preview
		mockGetV1CurrentDocument.mockReturnValue( { id: 123 } as never );

		// Act
		await loadCurrentDocumentClasses();

		// Assert - classes are fetched for the current V1 doc, not a stale V2 one
		expect( mockGetStylesForPost ).toHaveBeenCalledWith( 123, 'preview' );
		expect( mockGetStylesForPost ).toHaveBeenCalledWith( 123, 'frontend' );
	} );
} );
