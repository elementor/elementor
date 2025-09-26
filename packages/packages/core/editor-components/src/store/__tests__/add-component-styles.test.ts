import { createMockElementData, createMockStyleDefinition } from 'test-utils';
import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { addComponentStyles } from '../add-component-styles';
import { load } from '../component-config';
import { selectData, slice, SLICE_NAME } from '../components-styles-store';

jest.mock( '@elementor/store', () => {
	const actual = jest.requireActual( '@elementor/store' );
	return {
		...actual,
		__getState: jest.fn(),
		__dispatch: jest.fn(),
	};
} );

jest.mock( '../component-config', () => ( {
	load: jest.fn(),
} ) );

const STYLE_1 = createMockStyleDefinition( {
	id: 'style-1',
} );

const STYLE_2 = createMockStyleDefinition( {
	id: 'style-2',
} );

describe( 'addComponentStyles', () => {
	let mockStateData: Record< number, StyleDefinition[] >;

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

	it( 'should handle document without components', async () => {
		// Arrange
		const documentWithoutComponents = createMockElementData( {} );

		jest.mocked( load ).mockResolvedValue( documentWithoutComponents );

		// Act
		await addComponentStyles( [ 1 ] );

		// Assert
		expect( load ).toHaveBeenCalledTimes( 1 );
		expect( load ).toHaveBeenCalledWith( 1 );
	} );

	it( 'should handle document with one component', async () => {
		// Arrange
		const DOC_ID = 1;
		const COMP_ID = 2;

		const componentContent = createMockElementData( {
			id: String( COMP_ID ),
			elements: [
				createMockElementData( {
					styles: {
						[ STYLE_1.id ]: STYLE_1,
					},
				} ),
			],
		} );

		const documentWithOneComponent = createMockElementData( {
			id: String( DOC_ID ),
			elements: [ createMockComponentWidget( COMP_ID ) ],
		} );

		const responses = {
			[ DOC_ID ]: documentWithOneComponent,
			[ COMP_ID ]: componentContent,
		};

		jest.mocked( load ).mockImplementation( ( id ) =>
			Promise.resolve( responses[ id as keyof typeof responses ] )
		);

		// Act
		addComponentStyles( [ DOC_ID ] );

		// as it recursively calls itself, we need to run all timers
		await jest.runAllTimersAsync();

		// Assert
		expect( load ).toHaveBeenCalledTimes( 2 );
		expect( load ).toHaveBeenNthCalledWith( 1, DOC_ID );
		expect( load ).toHaveBeenNthCalledWith( 2, COMP_ID );

		expect( dispatch ).toHaveBeenCalledTimes( 2 );
		expect( dispatch ).toHaveBeenNthCalledWith( 1, slice.actions.add( { [ DOC_ID ]: [] } ) );
		expect( dispatch ).toHaveBeenNthCalledWith( 2, slice.actions.add( { [ COMP_ID ]: [ STYLE_1 ] } ) );

		expect( selectData( getState() ) ).toEqual( {
			[ DOC_ID ]: [],
			[ COMP_ID ]: [ STYLE_1 ],
		} );
	} );

	it( 'should handle document with components and nested components', async () => {
		// Arrange
		const DOC_ID = 1;
		const COMP_ID = 2;
		const NESTED_COMP_ID = 3;

		const nestedComponentContent = createMockElementData( {
			id: String( NESTED_COMP_ID ),
			elements: [
				createMockElementData( {
					styles: {
						[ STYLE_2.id ]: STYLE_2,
					},
				} ),
			],
		} );

		const componentContent = createMockElementData( {
			id: String( COMP_ID ),
			elements: [
				createMockElementData( {
					styles: {
						[ STYLE_1.id ]: STYLE_1,
					},
					elements: [ createMockComponentWidget( NESTED_COMP_ID ) ],
				} ),
			],
		} );

		const documentWithOneComponent = createMockElementData( {
			id: String( DOC_ID ),
			elements: [ createMockComponentWidget( COMP_ID ) ],
		} );

		const responses = {
			[ DOC_ID ]: documentWithOneComponent,
			[ COMP_ID ]: componentContent,
			[ NESTED_COMP_ID ]: nestedComponentContent,
		};

		jest.mocked( load ).mockImplementation( ( id ) =>
			Promise.resolve( responses[ id as keyof typeof responses ] )
		);

		// Act
		addComponentStyles( [ DOC_ID ] );

		// as it recursively calls itself, we need to run all timers
		await jest.runAllTimersAsync();

		// Assert
		expect( load ).toHaveBeenCalledTimes( 3 );
		expect( load ).toHaveBeenNthCalledWith( 1, DOC_ID );
		expect( load ).toHaveBeenNthCalledWith( 2, COMP_ID );
		expect( load ).toHaveBeenNthCalledWith( 3, NESTED_COMP_ID );

		expect( dispatch ).toHaveBeenCalledTimes( 3 );
		expect( dispatch ).toHaveBeenNthCalledWith( 1, slice.actions.add( { [ DOC_ID ]: [] } ) );
		expect( dispatch ).toHaveBeenNthCalledWith( 2, slice.actions.add( { [ COMP_ID ]: [ STYLE_1 ] } ) );
		expect( dispatch ).toHaveBeenNthCalledWith( 3, slice.actions.add( { [ NESTED_COMP_ID ]: [ STYLE_2 ] } ) );

		expect( selectData( getState() ) ).toEqual( {
			[ DOC_ID ]: [],
			[ COMP_ID ]: [ STYLE_1 ],
			[ NESTED_COMP_ID ]: [ STYLE_2 ],
		} );
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
