import * as React from 'react';
import { createMockElementType, createMockPropType, renderControl } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { ElementProvider, useElement } from '@elementor/editor-editing-panel';
import { getCurrentDocumentId } from '@elementor/editor-elements';
import { numberPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { __createStore, __registerSlice } from '@elementor/store';
import { generateUniqueId } from '@elementor/utils';
import { fireEvent, screen } from '@testing-library/react';

import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';
import { slice } from '../../../store/store';
import { updateOverridablePropOriginValue } from '../../../store/update-overridable-prop-origin-value';
import { OverridablePropControl } from '../overridable-prop-control';

jest.mock( '../../../store/update-overridable-prop-origin-value', () => {
	const actual = jest.requireActual( '../../../store/update-overridable-prop-origin-value' );
	return {
		...actual,
		updateOverridablePropOriginValue: jest.fn( actual.updateOverridablePropOriginValue ),
	};
} );
jest.mock( '@elementor/utils', () => ( {
	...jest.requireActual( '@elementor/utils' ),
	generateUniqueId: jest.fn(),
} ) );
jest.mock( '@elementor/editor-editing-panel', () => ( {
	...jest.requireActual( '@elementor/editor-editing-panel' ),
	useElement: jest.fn(),
} ) );
jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getCurrentDocumentId: jest.fn(),
} ) );

const MOCK_UNIQUE_ID = 'random-unique-id';
const MOCK_DOCUMENT_ID = 42;

const BIND_WITH_ORIGIN = 'with-origin';
const BIND = 'without-origin';
const BIND_NUMBER = 'number';

const MOCK_OVERRIDE_KEY = 'test-override-key';
const ELEMENT_TYPE = 'e-heading';

const mockPropType = createMockPropType( { kind: 'plain', key: 'string' } );
const mockPropTypeWithDefault = createMockPropType( {
	kind: 'plain',
	key: 'string',
	default: stringPropTypeUtil.create( 'Origin PropType Text' ),
} );
const mockNumberPropType = createMockPropType( { kind: 'plain', key: 'number' } );

const mockElementType = createMockElementType( {
	key: ELEMENT_TYPE,
	title: 'Heading',
	propsSchema: {
		[ BIND ]: mockPropType,
		[ BIND_WITH_ORIGIN ]: mockPropTypeWithDefault,
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
				bind: BIND_WITH_ORIGIN,
				label: 'Title with Origin',
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
		jest.mocked( getCurrentDocumentId ).mockReturnValue( MOCK_DOCUMENT_ID );
		jest.mocked( updateOverridablePropOriginValue ).mockClear();
	} );

	it.each( [
		{
			render: 'a text control with no value if value is not of overridable propType',
			bind: BIND,
			expected: '',
			value: stringPropTypeUtil.create( 'Hello, World' ),
		},
		{
			render: 'a text control with the value stored in origin_value',
			bind: BIND,
			expected: 'Origin Title',
			value: componentOverridablePropTypeUtil.create( {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: stringPropTypeUtil.create( 'Origin Title' ),
			} ),
		},
		{
			render: 'a text control with no content',
			bind: BIND,
			expected: '',
			value: componentOverridablePropTypeUtil.create( {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: stringPropTypeUtil.create( null ),
			} ),
		},
		{
			render: "a text control with the original prop type's origin value",
			bind: BIND_WITH_ORIGIN,
			expected: 'Origin PropType Text',
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
			$$type: 'overridable',
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
			origin_value: stringPropTypeUtil.create( 'Origin Title' ),
		} );
		const setValue = jest.fn();
		const props = { value, setValue, bind: BIND, propType: mockPropType };

		// Act
		renderOverridableControl( props );

		const input = screen.getByRole( 'textbox' );
		fireEvent.change( input, { target: { value: 'New Value' } } );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'overridable',
			value: {
				override_key: MOCK_OVERRIDE_KEY,
				origin_value: { $$type: 'string', value: 'New Value' },
			},
		} );

		expect( updateOverridablePropOriginValue ).toHaveBeenCalledWith( MOCK_DOCUMENT_ID, {
			override_key: MOCK_OVERRIDE_KEY,
			origin_value: { $$type: 'string', value: 'New Value' },
		} );
	} );
} );

function MockTextControl() {
	const { value, setValue } = useBoundProp( stringPropTypeUtil );
	return <input type="text" value={ value ?? '' } onChange={ ( e ) => setValue( e.target.value ) } />;
}

function MockNumberControl() {
	const { value, setValue } = useBoundProp( numberPropTypeUtil );
	return <input type="number" value={ value ?? '' } onChange={ ( e ) => setValue( Number( e.target.value ) ) } />;
}

function renderOverridableControl( props: Parameters< typeof renderControl >[ 1 ] ) {
	const OriginalControl = props.bind === BIND_NUMBER ? MockNumberControl : MockTextControl;

	return renderControl(
		<ElementProvider element={ { id: 'test-widget-id', type: ELEMENT_TYPE } } elementType={ mockElementType }>
			<OverridablePropControl OriginalControl={ OriginalControl } />
		</ElementProvider>,
		props
	);
}
