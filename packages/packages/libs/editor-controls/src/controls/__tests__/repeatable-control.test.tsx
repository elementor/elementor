import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { numberPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { RepeatableControl } from '../repeatable-control';

jest.mock( '../../bound-prop-context', () => ( {
	...jest.requireActual( '../../bound-prop-context' ),
	useBoundProp: jest.fn(),
} ) );

import { useBoundProp } from '../../bound-prop-context';
const mockUseBoundProp = useBoundProp as jest.MockedFunction< typeof useBoundProp >;

const stringPropType = createMockPropType( { kind: 'object' } );

const baseProps = {
	bind: 'items',
	setValue: jest.fn(),
	propType: stringPropType,
	value: [],
};

const mockTextControl = jest.fn( ( { placeholder } ) => (
	<input title="text-control" defaultValue={ placeholder } data-testid="text-control" />
) );

describe( '<RepeatableControl />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should create string-array prop type from child prop type', () => {
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: stringPropTypeUtil,
		};

		const setValue = jest.fn();

		mockUseBoundProp.mockReturnValue( {
			propType: createMockPropType( { kind: 'array' } ),
			value: [],
			setValue,
			bind: 'items',
			path: [],
			restoreValue: jest.fn(),
		} );

		const props = {
			...baseProps,
			value: [],
			setValue,
		};

		// Act
		renderControl(
			<RepeatableControl
				label="Text Items"
				repeaterLabel="Text items"
				childControlConfig={ childControlConfig }
				patternLabel={ '' }
			/>,
			props
		);

		const addButton = screen.getByRole( 'button', { name: /Add text items item/i } );
		fireEvent.click( addButton );
		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string-array',
			value: [ { $$type: 'string', value: null } ],
		} );
	} );

	it( 'should create number-array prop type from number prop type', () => {
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter number' },
			propTypeUtil: numberPropTypeUtil,
		};

		const setValue = jest.fn();

		mockUseBoundProp.mockReturnValue( {
			propType: createMockPropType( { kind: 'array' } ),
			value: [],
			setValue,
			bind: 'items',
			path: [],
			restoreValue: jest.fn(),
		} );

		const props = {
			...baseProps,
			value: [],
			setValue,
		};

		// Act
		renderControl(
			<RepeatableControl
				label="Number Items"
				repeaterLabel="Number items"
				childControlConfig={ childControlConfig }
			/>,
			props
		);

		const addButton = screen.getByRole( 'button', { name: /Add number items item/i } );
		fireEvent.click( addButton );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'number-array',
			value: [ { $$type: 'number', value: null } ],
		} );
	} );

	it( 'should pass label prop to Repeater', () => {
		// Arrange.
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: stringPropTypeUtil,
		};

		const props = {
			...baseProps,
			value: [],
		};

		// Act.
		renderControl(
			<RepeatableControl
				label="Custom Label"
				repeaterLabel="Custom label"
				childControlConfig={ childControlConfig }
			/>,
			props
		);

		// Assert.
		expect( screen.getByText( 'Custom label' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /Add custom label item/i } ) ).toBeInTheDocument();
	} );

	it( 'should render child control when add item button is pressed and valid config is provided', () => {
		// Arrange.
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: stringPropTypeUtil,
		};

		const props = {
			...baseProps,
			value: [],
		};

		// Act.
		renderControl(
			<RepeatableControl
				label="Text Items"
				repeaterLabel="Text items"
				childControlConfig={ childControlConfig }
			/>,
			props
		);

		const addButton = screen.getByRole( 'button', { name: /Add text items item/i } );
		fireEvent.click( addButton );

		// Assert.
		expect( screen.getByDisplayValue( 'Enter text' ) ).toBeInTheDocument();
	} );
} );
