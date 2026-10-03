import { getV1DocumentsManager } from '@elementor/editor-documents';
import { embeddedDocumentsManager } from '@elementor/editor-embedded-documents-manager';
import { __getState as getState } from '@elementor/store';

import { getComponentDocumentData } from '../../../utils/component-document-data';
import { loadAncestorDocumentsAssets } from '../load-ancestor-documents-assets';

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getState: jest.fn(),
} ) );

jest.mock( '@elementor/editor-documents' );
jest.mock( '@elementor/editor-embedded-documents-manager' );
jest.mock( '../../../utils/component-document-data' );

const INITIAL_PAGE_ID = 100;
const OUTER_COMPONENT_ID = 200;
const INNER_COMPONENT_ID = 300;

function mockState( currentComponentId: number | null, pathIds: number[] ) {
	jest.mocked( getState ).mockReturnValue( {
		components: {
			currentComponentId,
			path: pathIds.map( ( componentId ) => ( { componentId } ) ),
		},
	} );
}

describe( 'loadAncestorDocumentsAssets', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( getV1DocumentsManager ).mockReturnValue( {
			getInitialId: () => INITIAL_PAGE_ID,
		} as ReturnType< typeof getV1DocumentsManager > );

		jest.mocked( getComponentDocumentData ).mockImplementation( ( id ) =>
			Promise.resolve( { id, elements: [] } as unknown as Awaited<
				ReturnType< typeof getComponentDocumentData >
			> )
		);
	} );

	it( 'does nothing when no component is being edited', async () => {
		// Arrange
		mockState( null, [] );

		// Act
		await loadAncestorDocumentsAssets();

		// Assert
		expect( getComponentDocumentData ).not.toHaveBeenCalled();
		expect( embeddedDocumentsManager.setDocument ).not.toHaveBeenCalled();
	} );

	it( 'seeds initial page doc when editing a top-level component', async () => {
		// Arrange
		mockState( OUTER_COMPONENT_ID, [ OUTER_COMPONENT_ID ] );

		// Act
		await loadAncestorDocumentsAssets();

		// Assert
		expect( getComponentDocumentData ).toHaveBeenCalledTimes( 1 );
		expect( getComponentDocumentData ).toHaveBeenCalledWith( INITIAL_PAGE_ID );
		expect( embeddedDocumentsManager.setDocument ).toHaveBeenCalledWith(
			INITIAL_PAGE_ID,
			expect.objectContaining( { id: INITIAL_PAGE_ID } )
		);
	} );

	it( 'seeds initial page + outer component when editing a nested component', async () => {
		// Arrange
		mockState( INNER_COMPONENT_ID, [ OUTER_COMPONENT_ID, INNER_COMPONENT_ID ] );

		// Act
		await loadAncestorDocumentsAssets();

		// Assert
		expect( getComponentDocumentData ).toHaveBeenCalledWith( INITIAL_PAGE_ID );
		expect( getComponentDocumentData ).toHaveBeenCalledWith( OUTER_COMPONENT_ID );
		expect( getComponentDocumentData ).not.toHaveBeenCalledWith( INNER_COMPONENT_ID );
		expect( embeddedDocumentsManager.setDocument ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'skips docs that failed to load', async () => {
		// Arrange
		mockState( OUTER_COMPONENT_ID, [ OUTER_COMPONENT_ID ] );
		jest.mocked( getComponentDocumentData ).mockResolvedValueOnce( null );

		// Act
		await loadAncestorDocumentsAssets();

		// Assert
		expect( embeddedDocumentsManager.setDocument ).not.toHaveBeenCalled();
	} );
} );
