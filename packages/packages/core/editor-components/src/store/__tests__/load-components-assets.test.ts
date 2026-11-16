import { createMockDocument, createMockElementData } from 'test-utils';
import { type Document } from '@elementor/editor-documents';
import { embeddedDocumentsManager } from '@elementor/editor-embedded-documents-manager';

import { type ComponentDocumentsMap, getComponentDocuments } from '../../utils/get-component-documents';
import { loadComponentsAssets } from '../actions/load-components-assets';
import { loadComponentsOverridableProps } from '../actions/load-components-overridable-props';

jest.mock( '@elementor/editor-documents', () => ( {
	...jest.requireActual( '@elementor/editor-documents' ),
	setDocumentModifiedStatus: jest.fn(),
} ) );

jest.mock( '@elementor/editor-embedded-documents-manager', () => ( {
	embeddedDocumentsManager: {
		setDocument: jest.fn(),
	},
} ) );

jest.mock( '../../utils/get-component-documents' );

jest.mock( '../actions/load-components-overridable-props', () => ( {
	loadComponentsOverridableProps: jest.fn().mockResolvedValue( undefined ),
} ) );

const mockSetDocument = jest.mocked( embeddedDocumentsManager.setDocument );
const mockGetComponentDocuments = jest.mocked( getComponentDocuments );
const mockLoadComponentsOverridableProps = jest.mocked( loadComponentsOverridableProps );

const SINGLE_COMP_ID = 1;
const SINGLE_COMP_DOCUMENT = createMockDocument( { id: SINGLE_COMP_ID } );

const FIRST_COMP_ID = 10;
const FIRST_COMP_DOCUMENT = createMockDocument( { id: FIRST_COMP_ID } );
const SECOND_COMP_ID = 20;
const SECOND_COMP_DOCUMENT = createMockDocument( { id: SECOND_COMP_ID } );

const OVERRIDABLE_PROPS_FIRST_ID = 30;
const OVERRIDABLE_PROPS_FIRST_DOCUMENT = createMockDocument( { id: OVERRIDABLE_PROPS_FIRST_ID } );
const OVERRIDABLE_PROPS_SECOND_ID = 40;
const OVERRIDABLE_PROPS_SECOND_DOCUMENT = createMockDocument( { id: OVERRIDABLE_PROPS_SECOND_ID } );

const MOCK_ELEMENTS = [
	createMockElementData( {
		widgetType: 'e-component',
		elType: 'widget',
	} ),
];

describe( 'loadComponentsAssets', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it.each( [
		{
			should: 'a single component document',
			documents: createDocumentsMap( [ [ SINGLE_COMP_ID, SINGLE_COMP_DOCUMENT ] ] ),
			expectedSetDocumentCalls: [ [ SINGLE_COMP_ID, SINGLE_COMP_DOCUMENT ] ],
		},
		{
			should: 'multiple component documents',
			documents: createDocumentsMap( [
				[ FIRST_COMP_ID, FIRST_COMP_DOCUMENT ],
				[ SECOND_COMP_ID, SECOND_COMP_DOCUMENT ],
			] ),
			expectedSetDocumentCalls: [
				[ FIRST_COMP_ID, FIRST_COMP_DOCUMENT ],
				[ SECOND_COMP_ID, SECOND_COMP_DOCUMENT ],
			],
		},
	] )( 'should register $should via setDocument', async ( { documents, expectedSetDocumentCalls } ) => {
		// Arrange
		mockGetComponentDocuments.mockResolvedValue( documents );

		// Act
		await loadComponentsAssets( MOCK_ELEMENTS );

		// Assert
		expect( mockSetDocument ).toHaveBeenCalledTimes( expectedSetDocumentCalls.length );
		expectedSetDocumentCalls.forEach( ( [ id, document ] ) => {
			expect( mockSetDocument ).toHaveBeenCalledWith( id, document );
		} );
	} );

	it( 'should return early when elements array is empty', async () => {
		// Act
		await loadComponentsAssets( [] );

		// Assert
		expect( mockGetComponentDocuments ).not.toHaveBeenCalled();
		expect( mockSetDocument ).not.toHaveBeenCalled();
		expect( mockLoadComponentsOverridableProps ).not.toHaveBeenCalled();
	} );

	it( 'should not call setDocument when documents map is empty', async () => {
		// Arrange
		mockGetComponentDocuments.mockResolvedValue( createDocumentsMap( [] ) );

		// Act
		await loadComponentsAssets( MOCK_ELEMENTS );

		// Assert
		expect( mockSetDocument ).not.toHaveBeenCalled();
	} );

	it( 'should load overridable props for each component id', async () => {
		// Arrange
		const documents = createDocumentsMap( [
			[ OVERRIDABLE_PROPS_FIRST_ID, OVERRIDABLE_PROPS_FIRST_DOCUMENT ],
			[ OVERRIDABLE_PROPS_SECOND_ID, OVERRIDABLE_PROPS_SECOND_DOCUMENT ],
		] );
		mockGetComponentDocuments.mockResolvedValue( documents );

		// Act
		await loadComponentsAssets( MOCK_ELEMENTS );

		// Assert
		expect( mockLoadComponentsOverridableProps ).toHaveBeenCalledWith( [
			OVERRIDABLE_PROPS_FIRST_ID,
			OVERRIDABLE_PROPS_SECOND_ID,
		] );
	} );
} );

function createDocumentsMap( entries: [ number, Document ][] ): ComponentDocumentsMap {
	return new Map( entries );
}
