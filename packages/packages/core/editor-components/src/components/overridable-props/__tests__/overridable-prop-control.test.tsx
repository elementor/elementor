import * as React from 'react';
import { createMockElement, createMockElementType, createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { OverridablePropControl } from '../overridable-prop-control';
import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';
import { ElementProvider } from '../../../../../editor-editing-panel/src/contexts/element-context';
import { numberPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { generateUniqueId } from '@elementor/utils';
import { Control, ControlItem, V1Element } from '@elementor/editor-elements';

const MOCK_UNIQUE_ID = 'random-unique-id';

jest.mock( '@elementor/utils', () => ( {
    ...jest.requireActual( '@elementor/utils' ),
    generateUniqueId: () => MOCK_UNIQUE_ID,
} ) );

const BIND_WITH_DEFAULT = 'with-default';
const BIND = 'without-default';
const BIND_NUMBER = 'number';

const MOCK_OVERRIDE_KEY = 'test-override-key';
const ELEMENT_ID = 'element-123';
const ELEMENT_TYPE = 'e-heading';

const mockPropType = createMockPropType( { kind: 'plain', key: 'string' } );
const mockPropTypeWithDefault = createMockPropType( { kind: 'plain', key: 'string', default: stringPropTypeUtil.create( 'Default PropType Text' ) } );
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
        }
    ],
} );

const mockStringPropValue = stringPropTypeUtil.create( 'Hello, World' );

const mockOverridableValue = componentOverridablePropTypeUtil.create( {
    override_key: MOCK_OVERRIDE_KEY,
    default_value: stringPropTypeUtil.create( 'Default Title' ),
} );

describe( '<OverridablePropControl />', () => {
    it.each( [
        {
            render: 'nothing if control is not found in element type controls schema',
            bind: 'non-existent-bind',
            expected: null,
            value: null,
        },
        {
            render: 'the original control with no value if value is not of overridable propType',
            bind: BIND,
            expected: '',
            value: stringPropTypeUtil.create( 'Hello, World' ),
        },
        {
            render: 'the original control with the value stored in default_value',
            bind: BIND,
            expected: 'Default Title',
            value: componentOverridablePropTypeUtil.create( {
                override_key: MOCK_OVERRIDE_KEY,
                default_value: stringPropTypeUtil.create( 'Default Title' ),
            } ),
        },
        {
            render: 'the original control with no content',
            bind: BIND,
            expected: '',
            value: componentOverridablePropTypeUtil.create( {
                override_key: MOCK_OVERRIDE_KEY,
                default_value: null,
            } ),
        },
        {
            render: "the original control with the original prop type's default value",
            bind: BIND_WITH_DEFAULT,
            expected: 'Default PropType Text',
            value: componentOverridablePropTypeUtil.create( {
                override_key: MOCK_OVERRIDE_KEY,
                default_value: null,
            } ),
        }
    ] )( 'should render $render', ( { bind, expected, value } ) => {
        // Arrange
        const element = createMockElement( { model: { id: ELEMENT_ID } } );

        const props = { value, setValue: jest.fn(), bind, propType: mockPropType };

        // Act
        renderOverridableControl( props, element );

        // Assert
        if ( expected !== null ) {
            expect( screen.getByRole( 'textbox' ) ).toHaveValue( expected );
        } else {
            expect( screen.queryByRole( 'textbox' ) ).not.toBeInTheDocument();
        }
    } );


    it( 'should auto-generate override_key and wrap setValue when value is not overridable first', () => {
		// Arrange
		const element = createMockElement( { model: { id: ELEMENT_ID }, settings: { [ BIND ]: null } } );

		const value = null;
		const setValue = jest.fn();
		const props = { value, setValue, bind: BIND, propType: mockPropType };

		// Act
		renderOverridableControl( props, element );

		const input = screen.getByRole( 'textbox' );
		fireEvent.change( input, { target: { value: 'New Value' } } );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
            $$type: 'component-overridable',
            value: {
                override_key: MOCK_UNIQUE_ID,
                default_value: { $$type: 'string', value: 'New Value' },
            },
        } );
	} );

    it( 'should update only the default_value if override_key is set', () => {
        // Arrange
        const element = createMockElement( { model: { id: ELEMENT_ID } } );

        const value = componentOverridablePropTypeUtil.create( {
            override_key: MOCK_OVERRIDE_KEY,
            default_value: stringPropTypeUtil.create( 'Default Title' ),
        } );
        const setValue = jest.fn();
        const props = { value, setValue, bind: BIND, propType: mockPropType };

        // Act
        renderOverridableControl( props, element );

        const input = screen.getByRole( 'textbox' );
		fireEvent.change( input, { target: { value: 'New Value' } } );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
            $$type: 'component-overridable',
            value: {
                override_key: MOCK_OVERRIDE_KEY,
                default_value: { $$type: 'string', value: 'New Value' },
            },
        } );
    } );
} );

function renderOverridableControl(
	props: Parameters< typeof renderControl >[ 1 ],
	element: V1Element,
) {

	return renderControl(
		<ElementProvider element={ { ...element, type: ELEMENT_TYPE } } elementType={ mockElementType }>
			<OverridablePropControl />
		</ElementProvider>,
		props
	);
}
