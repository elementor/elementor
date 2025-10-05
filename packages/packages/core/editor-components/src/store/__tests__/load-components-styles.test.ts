import { createMockDocumentData, createMockElementData, createMockStyleDefinition } from 'test-utils';
import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { ajax } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { getParams } from '../../api';
import { type Element } from '../../types';
import { loadComponentsStyles } from '../load-components-styles';
import { selectStyles, SLICE_NAME } from '../store';

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getState: jest.fn(),
	__dispatch: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	ajax: {
		load: jest.fn(),
		invalidateCache: jest.fn(),
	},
} ) );

const STYLE_1 = createMockStyleDefinition( {
	id: 'style-1',
} );
const STYLE_2 = createMockStyleDefinition( {
	id: 'style-2',
} );

const SIMPLE_COMP_ID = 1;
const SIMPLE_COMP_CONTENT = createMockElementData( {
	id: String( SIMPLE_COMP_ID ),
} );
const SIMPLE_COMP_WIDGET = createMockComponentWidget( SIMPLE_COMP_ID );

const COMP_WITH_STYLES_ID = 2;
const COMP_WITH_STYLES_CONTENT = createMockElementData( {
	id: String( COMP_WITH_STYLES_ID ),
	elements: [
		createMockElementData( {
			styles: {
				[ STYLE_1.id ]: STYLE_1,
			},
		} ),
	],
} );
const COMP_WITH_STYLES_WIDGET = createMockComponentWidget( COMP_WITH_STYLES_ID );

const NESTED_COMP_ID = 3;
const NESTED_COMP_CONTENT = createMockElementData( {
	id: String( NESTED_COMP_ID ),
	elements: [
		createMockElementData( {
			styles: {
				[ STYLE_2.id ]: STYLE_2,
			},
		} ),
	],
} );
const NESTED_COMP_WIDGET = createMockComponentWidget( NESTED_COMP_ID );

const COMP_WITH_NESTED_COMP_ID = 4;
const COMP_WITH_NESTED_COMP_CONTENT = createMockElementData( {
	id: String( COMP_WITH_NESTED_COMP_ID ),
	elements: [ NESTED_COMP_WIDGET ],
} );
const COMP_WITH_NESTED_COMP_WIDGET = createMockComponentWidget( COMP_WITH_NESTED_COMP_ID );

describe( 'loadComponentsStyles', () => {
	let mockStateData: Record< number, StyleDefinition[] >;

	const items: {
		shouldHandle: string;
		documentElements: V1ElementData[];
		data: Record< string, V1ElementData >;
		expected: Record< string, StyleDefinition[] >;
	}[] = [
		{
			shouldHandle: 'components without styles',
			documentElements: [ SIMPLE_COMP_WIDGET ],
			data: {
				[ SIMPLE_COMP_ID ]: SIMPLE_COMP_CONTENT,
			},
			expected: {
				[ SIMPLE_COMP_ID ]: [],
			},
		},
		{
			shouldHandle: 'components with style',
			documentElements: [ COMP_WITH_STYLES_WIDGET ],
			data: {
				[ COMP_WITH_STYLES_ID ]: COMP_WITH_STYLES_CONTENT,
			},
			expected: {
				[ COMP_WITH_STYLES_ID ]: [ STYLE_1 ],
			},
		},
		{
			shouldHandle: 'components with nested components',
			documentElements: [ COMP_WITH_NESTED_COMP_WIDGET, COMP_WITH_STYLES_WIDGET ],
			data: {
				[ COMP_WITH_NESTED_COMP_ID ]: COMP_WITH_NESTED_COMP_CONTENT,
				[ COMP_WITH_STYLES_ID ]: COMP_WITH_STYLES_CONTENT,
				[ NESTED_COMP_ID ]: NESTED_COMP_CONTENT,
			},
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

		jest.useFakeTimers();
	} );

	it.each( items )( 'should handle $shouldHandle', async ( { documentElements, data, expected } ) => {
		// Arrange
		mockLoad( data );

		const document = createMockDocumentData( { elements: documentElements } );
		const uniqueIds = new Set( Object.keys( data ) );

		// Act
		await loadComponentsStyles( ( document.config.elements as Element[] ) ?? [] );

		// as it recursively calls itself, we need to run all timers
		await jest.runAllTimersAsync();

		// Assert
		expect( ajax.load ).toHaveBeenCalledTimes( uniqueIds.size );

		uniqueIds.forEach( ( id ) => {
			expect( ajax.load ).toHaveBeenCalledWith( getParams( Number( id ) ) );
		} );

		expect( selectStyles( getState() ) ).toEqual( expected );
	} );
} );

function createMockComponentWidget( componentId: number ): V1ElementData {
	return createMockElementData( {
		id: `test-component-${ componentId }`,
		elType: 'widget',
		widgetType: 'e-component',
		settings: {
			component_id: {
				$$type: 'number',
				value: componentId,
			},
		},
	} );
}

type Params = { id: number };
function mockLoad( responses: Record< number, V1ElementData > ) {
	jest.mocked( ajax.load< Params, V1ElementData > ).mockImplementation( ( { data } ) =>
		Promise.resolve( responses[ data.id ] )
	);
}
