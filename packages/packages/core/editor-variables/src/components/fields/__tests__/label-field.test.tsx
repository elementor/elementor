import * as React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';

import { ERROR_MESSAGES, VARIABLE_LABEL_MAX_LENGTH } from '../../../utils/validations';
import { LabelField, useLabelError } from '../label-field';

describe( 'LabelField', () => {
	const renderLabelField = ( props = {} ) => {
		const defaultProps = {
			value: 'test-label',
			onChange: jest.fn(),
			...props,
		};
		return {
			...render( <LabelField { ...defaultProps } /> ),
			props: defaultProps,
		};
	};

	it( 'should render with initial value', () => {
		// Arrange
		const { props } = renderLabelField();

		// Act
		const input = screen.getByRole( 'textbox' );

		// Assert
		expect( input ).toHaveValue( props.value );
	} );

	it( 'should call onChange with new value when input changes', () => {
		// Arrange
		const { props } = renderLabelField();
		const input = screen.getByRole( 'textbox' );

		// Act
		fireEvent.change( input, { target: { value: 'new-label' } } );

		// Assert
		expect( props.onChange ).toHaveBeenCalledWith( 'new-label' );
	} );

	it( 'should show error state when validation fails for empty value', () => {
		// Arrange
		const onErrorChange = jest.fn();
		renderLabelField( { onErrorChange } );
		const input = screen.getByRole( 'textbox' );

		// Act
		fireEvent.change( input, { target: { value: '' } } );

		// Assert
		expect( onErrorChange ).toHaveBeenCalledWith( ERROR_MESSAGES.MISSING_VARIABLE_NAME );
		expect( screen.getByRole( 'textbox' ) ).toHaveAttribute( 'aria-invalid', 'true' );
	} );

	it( 'should show error state when validation fails for invalid characters', () => {
		// Arrange
		const onErrorChange = jest.fn();
		renderLabelField( { onErrorChange } );
		const input = screen.getByRole( 'textbox' );

		// Act
		fireEvent.change( input, { target: { value: 'invalid@name' } } );

		// Assert
		expect( onErrorChange ).toHaveBeenCalledWith( ERROR_MESSAGES.INVALID_CHARACTERS );
		expect( screen.getByRole( 'textbox' ) ).toHaveAttribute( 'aria-invalid', 'true' );
	} );

	it( 'should show error state when validation fails for special characters only', () => {
		// Arrange
		const onErrorChange = jest.fn();
		renderLabelField( { onErrorChange } );
		const input = screen.getByRole( 'textbox' );

		// Act
		fireEvent.change( input, { target: { value: '_-_' } } );

		// Assert
		expect( onErrorChange ).toHaveBeenCalledWith( ERROR_MESSAGES.NO_NON_SPECIAL_CHARACTER );
		expect( screen.getByRole( 'textbox' ) ).toHaveAttribute( 'aria-invalid', 'true' );
	} );

	it( 'should show error state when validation fails for exceeding max length', () => {
		// Arrange
		const onErrorChange = jest.fn();
		renderLabelField( { onErrorChange } );
		const input = screen.getByRole( 'textbox' );
		const longValue = 'a'.repeat( VARIABLE_LABEL_MAX_LENGTH + 1 );

		// Act
		fireEvent.change( input, { target: { value: longValue } } );

		// Assert
		expect( onErrorChange ).toHaveBeenCalledWith( ERROR_MESSAGES.VARIABLE_LABEL_MAX_LENGTH );
		expect( screen.getByRole( 'textbox' ) ).toHaveAttribute( 'aria-invalid', 'true' );
	} );

	it( 'should call onChange with empty value when new value equals error value', () => {
		// Arrange
		const { props } = renderLabelField( {
			error: {
				value: 'duplicate',
				message: ERROR_MESSAGES.DUPLICATED_LABEL,
			},
		} );
		const input = screen.getByRole( 'textbox' );

		// Act
		fireEvent.change( input, { target: { value: 'duplicate' } } );

		// Assert
		expect( props.onChange ).toHaveBeenCalledWith( '' );
	} );

	it( 'should focus input when focusOnShow is true', () => {
		// Arrange & Act
		renderLabelField( { focusOnShow: true } );
		const input = screen.getByRole( 'textbox' );

		// Assert
		expect( input ).toHaveFocus();
	} );

	it( 'should accept valid variable names', () => {
		// Arrange
		const onErrorChange = jest.fn();
		renderLabelField( { onErrorChange } );
		const validNames = [ 'myVariable', 'my-variable', 'my_variable', 'my-variable-123', 'a1' ];
		const input = screen.getByRole( 'textbox' );

		// Act & Assert
		validNames.forEach( ( name ) => {
			fireEvent.change( input, { target: { value: name } } );
			expect( onErrorChange ).toHaveBeenLastCalledWith( '' );
			expect( screen.getByRole( 'textbox' ) ).not.toHaveAttribute( 'aria-invalid', 'true' );
		} );
	} );

	it( 'should select text on focus when selectOnShow is true', () => {
		// Arrange
		renderLabelField( { selectOnShow: true } );
		const input = screen.getByRole( 'textbox' ) as HTMLInputElement;

		// Act
		fireEvent.focus( input );

		// Assert
		expect( input.selectionStart ).toBe( 0 );
		expect( input.selectionEnd ).toBe( input.value.length );
	} );

	it( 'should call onKeyDown when a key is pressed', () => {
		// Arrange
		const onKeyDown = jest.fn();
		renderLabelField( { onKeyDown } );
		const input = screen.getByRole( 'textbox' );

		// Act
		fireEvent.keyDown( input, { key: 'Enter' } );

		// Assert
		expect( onKeyDown ).toHaveBeenCalledTimes( 1 );
		expect( onKeyDown ).toHaveBeenCalledWith( expect.objectContaining( { key: 'Enter' } ) );
	} );

	it( 'should call onKeyDown with correct event when Enter is pressed', () => {
		// Arrange
		const onKeyDown = jest.fn();
		renderLabelField( { onKeyDown } );
		const input = screen.getByRole( 'textbox' );

		// Act
		fireEvent.keyDown( input, { key: 'Enter', code: 'Enter' } );

		// Assert
		expect( onKeyDown ).toHaveBeenCalledTimes( 1 );
		const event = onKeyDown.mock.calls[ 0 ][ 0 ];
		expect( event.key ).toBe( 'Enter' );
	} );

	it( 'should call onKeyDown for any key press', () => {
		// Arrange
		const onKeyDown = jest.fn();
		renderLabelField( { onKeyDown } );
		const input = screen.getByRole( 'textbox' );

		// Act
		fireEvent.keyDown( input, { key: 'a' } );
		fireEvent.keyDown( input, { key: 'Escape' } );
		fireEvent.keyDown( input, { key: 'Tab' } );

		// Assert
		expect( onKeyDown ).toHaveBeenCalledTimes( 3 );
		expect( onKeyDown ).toHaveBeenNthCalledWith( 1, expect.objectContaining( { key: 'a' } ) );
		expect( onKeyDown ).toHaveBeenNthCalledWith( 2, expect.objectContaining( { key: 'Escape' } ) );
		expect( onKeyDown ).toHaveBeenNthCalledWith( 3, expect.objectContaining( { key: 'Tab' } ) );
	} );

	it( 'should work normally when onKeyDown is not provided', () => {
		// Arrange
		const { props } = renderLabelField();
		const input = screen.getByRole( 'textbox' );

		// Act
		fireEvent.keyDown( input, { key: 'Enter' } );
		fireEvent.change( input, { target: { value: 'new-value' } } );

		// Assert
		expect( props.onChange ).toHaveBeenCalledWith( 'new-value' );
		expect( input ).toHaveValue( 'new-value' );
	} );
} );

describe( 'useLabelError', () => {
	it( 'should initialize with default empty error state', () => {
		// Arrange & Act
		const { result } = renderHook( () => useLabelError() );

		// Assert
		expect( result.current.labelFieldError ).toEqual( {
			value: '',
			message: '',
		} );
	} );

	it( 'should initialize with provided error state', () => {
		// Arrange
		const initialError = { value: 'test', message: 'error message' };

		// Act
		const { result } = renderHook( () => useLabelError( initialError ) );

		// Assert
		expect( result.current.labelFieldError ).toEqual( initialError );
	} );

	it( 'should update error state using setLabelFieldError', () => {
		// Arrange
		const { result } = renderHook( () => useLabelError() );
		const newError = { value: 'new', message: 'new error' };

		// Act
		act( () => {
			result.current.setLabelFieldError( newError );
		} );

		// Assert
		expect( result.current.labelFieldError ).toEqual( newError );
	} );
} );
