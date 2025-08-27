import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import {
	Autocomplete,
	type CategorizedOption,
	type FlatOption,
	type Props as AutocompleteProps,
} from '../autocomplete';

const flatOptions: FlatOption[] = [
	{ id: '1', label: 'One' },
	{ id: '2', label: 'Two' },
];

const categorizedOptions: CategorizedOption[] = [
	{ id: '3', label: 'Three', groupLabel: 'Group 1' },
	{ id: '4', label: 'Four', groupLabel: 'Group 2' },
];

const basicProps: AutocompleteProps = {
	options: flatOptions,
	onOptionChange: jest.fn(),
	allowCustomValues: false,
};

const customValueProps: AutocompleteProps = {
	...basicProps,
	allowCustomValues: true,
};

describe( 'Autocomplete', () => {
	it( "should show no options when allowCustomValue is false, and input doesn't match options", () => {
		// Act.
		renderWithTheme( <Autocomplete { ...basicProps } value={ 'Moses' } placeholder={ 'test' } /> );

		const input = screen.getByPlaceholderText( 'test' );
		fireEvent.input( input, { target: { value: 'Moses' } } );

		// Assert.
		expect( screen.queryByRole( 'presentation' ) ).not.toBeInTheDocument();
	} );

	it( 'should allow values outside of options when allowCustomValues is on', () => {
		// Act.
		renderWithTheme( <Autocomplete { ...customValueProps } placeholder={ 'test' } /> );

		const input = screen.getByPlaceholderText( 'test' );
		fireEvent.input( input, { target: { value: '31' } } );

		// Assert.
		expect( screen.queryByText( 'No options' ) ).not.toBeInTheDocument();
	} );

	it( 'should mark corresponding option to saved value', () => {
		// Act.
		renderWithTheme( <Autocomplete { ...customValueProps } value={ 2 } placeholder={ 'test' } /> );

		const input: HTMLInputElement = screen.getByPlaceholderText( 'test' );

		// Assert.
		expect( flatOptions.some( ( { label } ) => label === input.value ) ).toBeTruthy();
	} );

	it( 'should not display options when input length is bellow minimum (2)', async () => {
		// Act.
		renderWithTheme( <Autocomplete { ...customValueProps } options={ flatOptions } placeholder={ 'test' } /> );

		const input: HTMLInputElement = screen.getByPlaceholderText( 'test' );
		fireEvent.input( input, { target: { value: 'O' } } );

		// Assert.
		expect( flatOptions.some( ( { label } ) => label === input.value ) ).toBeFalsy();
	} );

	it( 'should display options', () => {
		// Act.
		renderWithTheme( <Autocomplete { ...customValueProps } placeholder={ 'test' } value={ 'One' } /> );

		const input: HTMLInputElement = screen.getByPlaceholderText( 'test' );
		fireEvent.input( input, { target: { value: 'On' } } );

		// Assert.
		expect( flatOptions.filter( ( { label } ) => screen.queryByText( label ) ).length ).toBe( 1 );
	} );

	it( 'should group options when groupLabel is present', () => {
		// Act.
		renderWithTheme(
			<Autocomplete
				{ ...customValueProps }
				options={ categorizedOptions }
				placeholder={ 'test' }
				minInputLength={ 0 }
				value={ 'Th' }
			/>
		);

		const input = screen.getByPlaceholderText( 'test' );
		fireEvent.input( input, { target: { value: 'T' } } );

		// Assert.
		expect( categorizedOptions.filter( ( { label } ) => screen.queryByText( label ) ).length ).toBe( 1 );

		// Act.
		fireEvent.input( input, { target: { value: 'F' } } );

		// Assert.
		expect( categorizedOptions.filter( ( { label } ) => screen.queryByText( label ) ).length ).toBe( 1 );
	} );

	it( 'should clear input when clicking on clear input button, allowCustomValues is off', () => {
		// Arrange.
		const onTextChangeCallback = jest.fn();

		// Act.
		renderWithTheme(
			<Autocomplete
				{ ...basicProps }
				value={ 4 }
				options={ categorizedOptions }
				onTextChange={ onTextChangeCallback }
				placeholder={ 'test' }
			/>
		);

		const clearButton = screen.getByRole( 'button' );

		// Assert.
		expect( clearButton ).toBeVisible();

		// Act.
		fireEvent.click( clearButton );
		expect( onTextChangeCallback ).toHaveBeenCalledWith( null );
	} );

	it( 'should clear input when clicking on clear input button, allowCustomValues is on', () => {
		// Arrange.
		const onTextChangeCallback = jest.fn();

		// Act.
		renderWithTheme(
			<Autocomplete
				onTextChange={ onTextChangeCallback }
				{ ...customValueProps }
				value={ 4 }
				options={ flatOptions }
				placeholder={ 'test' }
			/>
		);

		const clearButton = screen.getByRole( 'button' );

		// Assert.
		expect( clearButton ).toBeVisible();

		// Act.
		fireEvent.click( clearButton );

		// Assert.
		expect( onTextChangeCallback ).toHaveBeenCalledWith( null );
	} );

	it( 'should not display clear button when value is empty', () => {
		// Act.
		renderWithTheme( <Autocomplete { ...basicProps } options={ flatOptions } placeholder={ 'test' } /> );

		// Assert.
		expect( screen.queryAllByRole( 'button' ) ).toStrictEqual( [] );
	} );
} );
