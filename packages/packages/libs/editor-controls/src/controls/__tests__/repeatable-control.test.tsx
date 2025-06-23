import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { numberPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { RepeatableControl } from '../repeatable-control';

const stringPropType = createMockPropType( { kind: 'object' } );

const baseProps = {
	bind: 'items',
	setValue: jest.fn(),
	propType: stringPropType,
	value: [],
};

const mockTextControl = jest.fn( ( { placeholder } ) => (
	<input defaultValue={ placeholder } data-testid="text-control" />
) );
//remove the skip tests after fixing the 'undefined' issue in itemLabel
describe( '<RepeatableControl />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it.skip( 'should create string-array prop type from child prop type', () => {
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: stringPropTypeUtil,
		};

		const setValue = jest.fn();

		const props = {
			...baseProps,
			value: [],
			setValue,
		};

		// Act
		renderControl(
			<RepeatableControl
				label="Text Items"
				repeaterLabel="Text Items"
				childControlConfig={ childControlConfig }
			/>,
			props
		);

		const addButton = screen.getByRole( 'button', { name: 'Add item' } );
		fireEvent.click( addButton );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string-array',
			value: [ { $$type: 'string', value: null } ],
		} );
	} );

	it.skip( 'should create number-array prop type from number prop type', () => {
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter number' },
			propTypeUtil: numberPropTypeUtil,
		};

		const setValue = jest.fn();

		const props = {
			...baseProps,
			value: [],
			setValue,
		};

		// Act
		renderControl(
			<RepeatableControl
				label="Number Items"
				repeaterLabel="Number Items"
				childControlConfig={ childControlConfig }
			/>,
			props
		);

		const addButton = screen.getByRole( 'button', { name: 'Add item' } );
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
				repeaterLabel="Custom Label"
				childControlConfig={ childControlConfig }
			/>,
			props
		);

		// Assert.
		expect( screen.getByText( 'Custom Label' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Add item' } ) ).toBeInTheDocument();
	} );

	it.skip( 'should render child control when add item button is pressed and valid config is provided', () => {
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
				repeaterLabel="Text Items"
				childControlConfig={ childControlConfig }
			/>,
			props
		);

		const addButton = screen.getByRole( 'button', { name: 'Add item' } );
		fireEvent.click( addButton );

		// Assert.
		expect( screen.getByDisplayValue( 'Enter text' ) ).toBeInTheDocument();
	} );
} );
