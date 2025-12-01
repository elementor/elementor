import * as React from 'react';
import { createMockElementType, createMockPropType, renderControl } from 'test-utils';
import { ElementProvider, useElement } from '@elementor/editor-editing-panel';
import { numberPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { generateUniqueId } from '@elementor/utils';
import { fireEvent, screen } from '@testing-library/react';

import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';
import { OverridablePropControl } from '../overridable-prop-control';
import { __createStore, __registerSlice } from '@elementor/store';
import { slice } from '../../../store/store';

jest.mock( '@elementor/utils', () => ( {
	...jest.requireActual( '@elementor/utils' ),
	generateUniqueId: jest.fn(),
} ) );
jest.mock( '@elementor/editor-editing-panel', () => ( {
	...jest.requireActual( '@elementor/editor-editing-panel' ),
	useElement: jest.fn(),
} ) );

const MOCK_UNIQUE_ID = 'random-unique-id';

const BIND_WITH_DEFAULT = 'with-default';
const BIND = 'without-default';
const BIND_NUMBER = 'number';

const MOCK_OVERRIDE_KEY = 'test-override-key';
const ELEMENT_TYPE = 'e-heading';

const mockPropType = createMockPropType( { kind: 'plain', key: 'string' } );
const mockPropTypeWithDefault = createMockPropType( {
	kind: 'plain',
	key: 'string',
	default: stringPropTypeUtil.create( 'Default PropType Text' ),
} );
const mockNumberPropType = createMockPropType( { kind: 'plain', key: 'number' } );

const mockElementType = createMockElementType( {
	key: ELEMENT_TYPE,
	title: 'Heading',
	propsSchema: {
		[ BIND ]: mockPropType,
		[ BIND_WITH_DEFAULT ]: mockPropTypeWithDefault,
		[ BIND_NUMBER ]: mockNumberPropType,
	},
	controls: [
		{
			type: 'section',
			value: {
				label: 'Content',
				items: [
					{
						type: 'control',
						value: {
							type: 'text',
							bind: BIND,
							label: 'Title',
							props: {},
						},
					},
					{
						type: 'control',
						value: {
							type: 'number',
							bind: BIND_NUMBER,
							label: 'Number',
							props: {},
						},
					},
				],
			},
		},
		{
			type: 'control',
			value: {
				type: 'text',
				bind: BIND_WITH_DEFAULT,
				label: 'Title with Default',
				props: {},
			},
		},
	],
} );

describe( '<OverridablePropControl />', () => {
	beforeEach( () => {
		__registerSlice( slice );
		__createStore();

		jest.mocked( useElement ).mockReturnValue( {
			element: { id: 'test-widget-id', type: ELEMENT_TYPE },
			elementType: mockElementType,
		} );

		jest.mocked( generateUniqueId ).mockReturnValue( MOCK_UNIQUE_ID );
	} );

	it.each( [
		{
			render: 'nothing if control is not found in element type controls schema',
			bind: 'non-existent-bind',
			expected: null,
			value: null,
		},
		{
			render: 'a text control with no value if value is not of overridable propType',
			bind: BIND,
			expected: '',
			value: stringPropTypeUtil.create( 'Hello, World' ),
		},
		{
			render: 'a text control with the value stored in default_value',
			bind: BIND,
			expected: 'Default Title',
			value: componentOverridablePropTypeUtil.create( {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: stringPropTypeUtil.create( 'Default Title' ),
			} ),
		},
		{
			render: 'a text control with no content',
			bind: BIND,
			expected: '',
			value: componentOverridablePropTypeUtil.create( {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: null,
			} ),
		},
		{
			render: "a text control with the original prop type's default value",
			bind: BIND_WITH_DEFAULT,
			expected: 'Default PropType Text',
			value: componentOverridablePropTypeUtil.create( {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: null,
			} ),
		},
		{
			render: 'a number control',
			bind: BIND_NUMBER,
			expected: 0,
			value: componentOverridablePropTypeUtil.create( {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: numberPropTypeUtil.create( 0 ),
			} ),
		},
	] )( 'should render $render', ( { bind, expected, value } ) => {
		// Arrange
		const props = { value, setValue: jest.fn(), bind, propType: mockPropType };

		// Act
		renderOverridableControl( props );

		// Assert
		if ( expected !== null ) {
			if ( bind === BIND_NUMBER ) {
				expect( screen.getByRole( 'spinbutton' ) ).toHaveValue( expected );
				return;
			}

			expect( screen.getByRole( 'textbox' ) ).toHaveValue( expected );
			return;
		}

		expect( screen.queryByRole( 'spinbutton' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'textbox' ) ).not.toBeInTheDocument();
	} );

	it( 'should auto-generate override_key and wrap setValue when value is not overridable first', () => {
		// Arrange
		const value = null;
		const setValue = jest.fn();
		const props = { value, setValue, bind: BIND, propType: mockPropType };

		// Act
		renderOverridableControl( props );

		const input = screen.getByRole( 'textbox' );
		fireEvent.change( input, { target: { value: 'New Value' } } );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'component-overridable',
			value: {
				override_key: MOCK_UNIQUE_ID,
				origin_value: { $$type: 'string', value: 'New Value' },
			},
		} );
	} );

	it( 'should update only the origin_value if override_key is set', () => {
		// Arrange
		const value = componentOverridablePropTypeUtil.create( {
			override_key: MOCK_OVERRIDE_KEY,
			origin_value: stringPropTypeUtil.create( 'Default Title' ),
		} );
		const setValue = jest.fn();
		const props = { value, setValue, bind: BIND, propType: mockPropType };

		// Act
		renderOverridableControl( props );

		const input = screen.getByRole( 'textbox' );
		fireEvent.change( input, { target: { value: 'New Value' } } );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'component-overridable',
			value: {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: { $$type: 'string', value: 'New Value' },
			},
		} );
	} );
} );

function renderOverridableControl( props: Parameters< typeof renderControl >[ 1 ] ) {
	return renderControl(
		<ElementProvider element={ { id: 'test-widget-id', type: ELEMENT_TYPE } } elementType={ mockElementType }>
			<OverridablePropControl />
		</ElementProvider>,
		props
	);
}
