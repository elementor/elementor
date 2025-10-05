import { createMockDocumentData, createMockElementData, createMockStyleDefinition } from 'test-utils';
import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { load } from '../component-config';
import { selectData, SLICE_NAME } from '../components-styles-store';
import { loadComponentsStyles } from '../load-components-styles';
import { Element } from '../../types';

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getState: jest.fn(),
	__dispatch: jest.fn(),
} ) );

jest.mock( '../component-config', () => ( {
	...jest.requireActual( '../component-config' ),
	load: jest.fn(),
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
	]

	beforeEach( () => {
		jest.clearAllMocks();

		mockStateData = {};

		jest.mocked( getState ).mockImplementation( () => ( {
			[ SLICE_NAME ]: { data: mockStateData },
		} ) );

		jest.mocked( dispatch ).mockImplementation( ( action ) => {
			if ( action.type === `${ SLICE_NAME }/add` ) {
				mockStateData = { ...mockStateData, ...action.payload };
			}
		} );

		jest.useFakeTimers();
	} );

	it.each( items )(
		'should handle $shouldHandle',
		async ( {
			documentElements,
			data,
			expected,
		} ) => {
			// Arrange
			mockLoad( data );

			const document = createMockDocumentData({ elements: documentElements });
			const uniqueIds = new Set( Object.keys( data ));

			// Act
			await loadComponentsStyles( document.config.elements as Element[] ?? [] );
			
			// as it recursively calls itself, we need to run all timers
			await jest.runAllTimersAsync();

			// Assert
			expect( load ).toHaveBeenCalledTimes( uniqueIds.size );

			uniqueIds.forEach( ( id ) => {
				expect( load ).toHaveBeenCalledWith( Number( id ) );
			} );

			expect( selectData( getState() ) ).toEqual( expected );
		}
	);
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

function mockLoad( responses: Record< number, V1ElementData > ) {
	jest.mocked( load ).mockImplementation( ( id ) => Promise.resolve( responses[ id as keyof typeof responses ] ) );
}
