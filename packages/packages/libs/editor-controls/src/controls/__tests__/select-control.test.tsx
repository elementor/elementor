import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { SelectControl } from '../select-control';

const propType = createMockPropType( { kind: 'plain' } );

describe( 'SelectControl', () => {
	const defaultOptions = [
		{ label: 'Option 1', value: 'value1' },
		{ label: 'Option 2', value: 'value2' },
	];

	it( 'should pass the updated payload when select value changes', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = { setValue, value: { $$type: 'string', value: 'value1' }, bind: 'tag', propType };

		// Act.
		renderControl( <SelectControl options={ defaultOptions } />, props );

		const select = screen.getByRole( 'combobox' );

		// Assert.
		expect( screen.getByText( 'Option 1' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Option 2' ) ).not.toBeInTheDocument();

		// Act.
		fireEvent.mouseDown( select );

		const option2 = screen.getByText( 'Option 2' );

		fireEvent.click( option2 );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'value2',
		} );
	} );

	it( 'should disable the select options', () => {
		// Arrange.
		const setValue = jest.fn();
		const options = [
			{ label: 'Option 1', value: 'value1' },
			{ label: 'Option 2', value: 'value2', disabled: true },
			{ label: 'Option 3', value: 'value3', disabled: false },
		];

		const props = { setValue, value: { $$type: 'string', value: 'value1' }, bind: 'tag', propType };

		// Act.
		renderControl( <SelectControl options={ options } />, props );

		const select = screen.getByRole( 'combobox' );

		// Act.
		fireEvent.mouseDown( select );

		const option2 = screen.getByRole( 'option', { name: 'Option 2' } );
		const option3 = screen.getByRole( 'option', { name: 'Option 3' } );

		// Assert.
		expect( option2 ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( option3 ).not.toHaveAttribute( 'aria-disabled', 'true' );
	} );

	it( 'should display the selected option label when value is set', () => {
		// Arrange.
		const propsWithValue = {
			setValue: jest.fn(),
			value: { $$type: 'string', value: 'value2' },
			bind: 'tag',
			propType,
		};

		// Act.
		renderControl( <SelectControl options={ defaultOptions } />, propsWithValue );

		// Assert.
		expect( screen.getByText( 'Option 2' ) ).toBeInTheDocument();
	} );

	it( 'should display placeholder when no value is set and placeholder is provided', () => {
		// Arrange.
		const propsWithPlaceholder = {
			setValue: jest.fn(),
			value: { $$type: 'string', value: null },
			placeholder: { $$type: 'string', value: 'My placeholder' },
			bind: 'tag',
			propType,
		};

		// Act.
		renderControl( <SelectControl options={ defaultOptions } />, propsWithPlaceholder );

		// Assert.
		expect( screen.getByText( 'My placeholder' ) ).toBeInTheDocument();
	} );

	it( 'should display empty state when no value and no placeholder', () => {
		// Arrange.
		const propsWithoutValueOrPlaceholder = {
			setValue: jest.fn(),
			value: { $$type: 'string', value: null },
			placeholder: undefined,
			bind: 'tag',
			propType,
		};

		// Act.
		renderControl( <SelectControl options={ defaultOptions } />, propsWithoutValueOrPlaceholder );

		// Assert.
		const select = screen.getByRole( 'combobox' );
		const onlyWhitespaceOrZeroWidthChars = /^[\s\u200B-\u200D\uFEFF]*$/;
		expect( select ).toHaveTextContent( onlyWhitespaceOrZeroWidthChars );
	} );

	it( 'should handle empty string value same as null', () => {
		// Arrange.
		const propsWithEmptyValue = {
			setValue: jest.fn(),
			value: { $$type: 'string', value: '' },
			placeholder: { $$type: 'string', value: 'My placeholder' },
			bind: 'tag',
			propType,
		};

		// Act.
		renderControl( <SelectControl options={ defaultOptions } />, propsWithEmptyValue );

		// Assert.
		expect( screen.getByText( 'My placeholder' ) ).toBeInTheDocument();
	} );

	it( 'should update from placeholder to selected value when option is chosen', () => {
		// Arrange.
		const setValue = jest.fn();
		const propsWithPlaceholder = {
			setValue,
			value: { $$type: 'string', value: null },
			placeholder: { $$type: 'string', value: 'My placeholder' },
			bind: 'tag',
			propType,
		};

		renderControl( <SelectControl options={ defaultOptions } />, propsWithPlaceholder );
		const select = screen.getByRole( 'combobox' );
		expect( screen.getByText( 'My placeholder' ) ).toBeInTheDocument();

		// Act.
		fireEvent.mouseDown( select );
		const option3 = screen.getByText( 'Option 2' );
		fireEvent.click( option3 );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'value2',
		} );
	} );

	it( 'should show all options in dropdown regardless of placeholder state', () => {
		// Arrange.
		const propsWithPlaceholder = {
			setValue: jest.fn(),
			value: { $$type: 'string', value: null },
			placeholder: { $$type: 'string', value: 'Choose one' },
			bind: 'tag',
			propType,
		};

		// Act.
		renderControl( <SelectControl options={ defaultOptions } />, propsWithPlaceholder );

		const select = screen.getByRole( 'combobox' );
		fireEvent.mouseDown( select );

		// Assert.
		defaultOptions.forEach( ( option ) => {
			expect( screen.getByText( option.label ) ).toBeInTheDocument();
		} );
	} );

	it( 'should handle onChange callback with placeholder state', () => {
		// Arrange.
		const setValue = jest.fn();
		const onChange = jest.fn();
		const propsWithPlaceholder = {
			setValue,
			value: { $$type: 'string', value: null },
			placeholder: { $$type: 'string', value: 'Select' },
			bind: 'tag',
			propType,
		};

		// Act.
		renderControl( <SelectControl options={ defaultOptions } onChange={ onChange } />, propsWithPlaceholder );

		const select = screen.getByRole( 'combobox' );
		fireEvent.mouseDown( select );

		const option1 = screen.getByText( 'Option 1' );
		fireEvent.click( option1 );

		// Assert.
		expect( onChange ).toHaveBeenCalledWith( 'value1', null );
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'value1',
		} );
	} );

	it( 'should correctly render value when switching from placeholder to value and back', () => {
		// Arrange.
		let currentValue = '';
		const setValue = jest.fn( ( newValue ) => {
			currentValue = newValue.value;
		} );

		const getProps = () => ( {
			setValue,
			value: { $$type: 'string', value: currentValue },
			placeholder: { $$type: 'string', value: 'Default text' },
			bind: 'tag',
			propType,
		} );

		const { rerender } = renderControl( <SelectControl options={ defaultOptions } />, getProps() );
		const select = screen.getByRole( 'combobox' );
		expect( screen.getByText( 'Default text' ) ).toBeInTheDocument();

		fireEvent.mouseDown( select );
		fireEvent.click( screen.getByText( 'Option 2' ) );

		currentValue = 'value2';
		rerender( <SelectControl options={ defaultOptions } /> );

		expect( screen.getByText( 'Option 2' ) ).toBeInTheDocument();

		currentValue = '';
		rerender( <SelectControl options={ defaultOptions } /> );

		expect( screen.getByText( 'Default text' ) ).toBeInTheDocument();
	} );

	it( 'should display label for option with null value when there is no placeholder', () => {
		const optionsWithNullOutset = [
			{ label: 'With value', value: 'some-value' },
			{ label: 'Without value', value: null },
		];

		const propsOutsetSelected = {
			setValue: jest.fn(),
			value: stringPropTypeUtil.create( null ),
			placeholder: undefined,
			bind: 'tag',
			propType,
		};

		renderControl( <SelectControl options={ optionsWithNullOutset } />, propsOutsetSelected );

		expect( screen.getByRole( 'combobox' ) ).toHaveTextContent( 'Without value' );
	} );

	it( 'should handle options with null values correctly with placeholder', () => {
		// Arrange.
		const optionsWithNull = [
			{ label: 'None', value: null },
			{ label: 'Option 1', value: 'value1' },
			{ label: 'Option 2', value: 'value2' },
		];

		const propsWithPlaceholder = {
			setValue: jest.fn(),
			value: { $$type: 'string', value: null },
			placeholder: { $$type: 'string', value: 'Choose' },
			bind: 'tag',
			propType,
		};

		// Act.
		renderControl( <SelectControl options={ optionsWithNull } />, propsWithPlaceholder );

		// Assert.
		const select = screen.getByRole( 'combobox' );
		expect( screen.getByText( 'Choose' ) ).toBeInTheDocument();

		fireEvent.mouseDown( select );
		expect( screen.getByText( 'None' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Option 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Option 2' ) ).toBeInTheDocument();
	} );

	describe( 'grouped options', () => {
		const groups = [
			{
				label: 'Group A',
				options: [
					{ label: 'A Option 1', value: 'a1' },
					{ label: 'A Option 2', value: 'a2' },
				],
			},
			{
				label: 'Group B',
				options: [ { label: 'B Option 1', value: 'b1' } ],
			},
		];

		it( 'should render a subheader per group with its own options', () => {
			// Arrange.
			const props = { setValue: jest.fn(), value: { $$type: 'string', value: 'a1' }, bind: 'tag', propType };

			// Act.
			renderControl( <SelectControl groups={ groups } />, props );

			const select = screen.getByRole( 'combobox' );
			fireEvent.mouseDown( select );

			// Assert.
			expect( screen.getByText( 'Group A' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Group B' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'option', { name: 'A Option 1' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'option', { name: 'A Option 2' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'option', { name: 'B Option 1' } ) ).toBeInTheDocument();
		} );

		it( 'should resolve the selected value label across groups', () => {
			// Arrange.
			const props = { setValue: jest.fn(), value: { $$type: 'string', value: 'b1' }, bind: 'tag', propType };

			// Act.
			renderControl( <SelectControl groups={ groups } />, props );

			// Assert.
			expect( screen.getByRole( 'combobox' ) ).toHaveTextContent( 'B Option 1' );
		} );

		it( 'should select a value from a grouped option and call setValue', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = { setValue, value: { $$type: 'string', value: null }, bind: 'tag', propType };

			// Act.
			renderControl( <SelectControl groups={ groups } />, props );

			const select = screen.getByRole( 'combobox' );
			fireEvent.mouseDown( select );
			fireEvent.click( screen.getByRole( 'option', { name: 'B Option 1' } ) );

			// Assert.
			expect( setValue ).toHaveBeenCalledWith( {
				$$type: 'string',
				value: 'b1',
			} );
		} );
	} );
} );
