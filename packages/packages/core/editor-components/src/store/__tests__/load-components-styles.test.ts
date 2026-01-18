import { createMockDocument, createMockElementData, createMockStyleDefinition } from 'test-utils';
import { type Document } from '@elementor/editor-documents';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentDocumentsMap } from '../../utils/get-component-documents';
import { loadComponentsStyles } from '../actions/load-components-styles';
import { selectStyles, slice, SLICE_NAME } from '../store';

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getState: jest.fn(),
	__dispatch: jest.fn(),
} ) );

const STYLE_1 = createMockStyleDefinition( {
	id: 'style-1',
} );
const STYLE_2 = createMockStyleDefinition( {
	id: 'style-2',
} );

const SIMPLE_COMP_ID = 1;
const SIMPLE_COMP_DOCUMENT = createMockDocument( { id: SIMPLE_COMP_ID, elements: [] } );

const COMP_WITH_STYLES_ID = 2;
const COMP_WITH_STYLES_DOCUMENT = createMockDocument( {
	id: COMP_WITH_STYLES_ID,
	elements: [
		createMockElementData( {
			styles: {
				[ STYLE_1.id ]: STYLE_1,
			},
		} ),
	],
} );

const NESTED_COMP_ID = 3;
const NESTED_COMP_DOCUMENT = createMockDocument( {
	id: NESTED_COMP_ID,
	elements: [
		createMockElementData( {
			styles: {
				[ STYLE_2.id ]: STYLE_2,
			},
		} ),
	],
} );

const COMP_WITH_NESTED_COMP_ID = 4;
const COMP_WITH_NESTED_COMP_DOCUMENT = createMockDocument( { id: COMP_WITH_NESTED_COMP_ID, elements: [] } );

describe( 'loadComponentsStyles', () => {
	let mockStateData: Record< number, StyleDefinition[] >;

	const items: {
		shouldHandle: string;
		documents: ComponentDocumentsMap;
		expected: Record< string, StyleDefinition[] >;
	}[] = [
		{
			shouldHandle: 'components without styles',
			documents: createDocumentsMap( [ [ SIMPLE_COMP_ID, SIMPLE_COMP_DOCUMENT ] ] ),
			expected: {
				[ SIMPLE_COMP_ID ]: [],
			},
		},
		{
			shouldHandle: 'components with style',
			documents: createDocumentsMap( [ [ COMP_WITH_STYLES_ID, COMP_WITH_STYLES_DOCUMENT ] ] ),
			expected: {
				[ COMP_WITH_STYLES_ID ]: [ STYLE_1 ],
			},
		},
		{
			shouldHandle: 'multiple components with styles',
			documents: createDocumentsMap( [
				[ COMP_WITH_NESTED_COMP_ID, COMP_WITH_NESTED_COMP_DOCUMENT ],
				[ COMP_WITH_STYLES_ID, COMP_WITH_STYLES_DOCUMENT ],
				[ NESTED_COMP_ID, NESTED_COMP_DOCUMENT ],
			] ),
			expected: {
				[ COMP_WITH_NESTED_COMP_ID ]: [],
				[ COMP_WITH_STYLES_ID ]: [ STYLE_1 ],
				[ NESTED_COMP_ID ]: [ STYLE_2 ],
			},
		},
	];

	beforeEach( () => {
		jest.clearAllMocks();

		mockStateData = {};

		jest.mocked( getState ).mockImplementation( () => ( {
			[ SLICE_NAME ]: { styles: mockStateData },
		} ) );

		jest.mocked( dispatch ).mockImplementation( ( action ) => {
			if ( action.type === `${ SLICE_NAME }/addStyles` ) {
				mockStateData = { ...mockStateData, ...action.payload };
			}
		} );
	} );

	it.each( items )( 'should handle $shouldHandle', ( { documents, expected } ) => {
		// Act
		loadComponentsStyles( documents );

		// Assert
		expect( selectStyles( getState() ) ).toEqual( expected );
	} );

	it( 'should dispatch addStyles action with extracted styles', () => {
		// Arrange
		const documents = createDocumentsMap( [ [ COMP_WITH_STYLES_ID, COMP_WITH_STYLES_DOCUMENT ] ] );

		// Act
		loadComponentsStyles( documents );

		// Assert
		expect( dispatch ).toHaveBeenCalledWith( slice.actions.addStyles( { [ COMP_WITH_STYLES_ID ]: [ STYLE_1 ] } ) );
	} );

	it( 'should skip components that are already in the store', () => {
		// Arrange
		mockStateData = { [ COMP_WITH_STYLES_ID ]: [ STYLE_1 ] };
		const documents = createDocumentsMap( [
			[ COMP_WITH_STYLES_ID, COMP_WITH_STYLES_DOCUMENT ],
			[ NESTED_COMP_ID, NESTED_COMP_DOCUMENT ],
		] );

		// Act
		loadComponentsStyles( documents );

		// Assert
		expect( dispatch ).toHaveBeenCalledWith( slice.actions.addStyles( { [ NESTED_COMP_ID ]: [ STYLE_2 ] } ) );
	} );

	it( 'should not dispatch if all components are already known', () => {
		// Arrange
		mockStateData = { [ COMP_WITH_STYLES_ID ]: [ STYLE_1 ] };
		const documents = createDocumentsMap( [ [ COMP_WITH_STYLES_ID, COMP_WITH_STYLES_DOCUMENT ] ] );

		// Act
		loadComponentsStyles( documents );

		// Assert
		expect( dispatch ).not.toHaveBeenCalled();
	} );

	it( 'should not dispatch if documents map is empty', () => {
		// Arrange
		const documents = createDocumentsMap( [] );

		// Act
		loadComponentsStyles( documents );

		// Assert
		expect( dispatch ).not.toHaveBeenCalled();
	} );
} );

function createDocumentsMap( entries: [ number, Document ][] ): ComponentDocumentsMap {
	return new Map( entries );
}
