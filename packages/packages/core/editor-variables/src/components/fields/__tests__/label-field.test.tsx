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
		const { props } = renderLabelField();

		const input = screen.getByRole( 'textbox' );
		expect( input ).toHaveValue( props.value );
	} );

	it( 'should call onChange with new value when input changes', () => {
		const { props } = renderLabelField();

		const input = screen.getByRole( 'textbox' );
		fireEvent.change( input, { target: { value: 'new-label' } } );

		expect( props.onChange ).toHaveBeenCalledWith( 'new-label' );
	} );

	it( 'should show error state when validation fails for empty value', () => {
		const onErrorChange = jest.fn();
		renderLabelField( { onErrorChange } );

		const input = screen.getByRole( 'textbox' );
		fireEvent.change( input, { target: { value: '' } } );

		expect( screen.getByRole( 'textbox' ) ).toHaveClass( 'Mui-error' );
		expect( onErrorChange ).toHaveBeenCalledWith( ERROR_MESSAGES.MISSING_VARIABLE_NAME );
	} );

	it( 'should show error state when validation fails for invalid characters', () => {
		const onErrorChange = jest.fn();
		renderLabelField( { onErrorChange } );

		const input = screen.getByRole( 'textbox' );
		fireEvent.change( input, { target: { value: 'invalid@name' } } );

		expect( screen.getByRole( 'textbox' ) ).toHaveClass( 'Mui-error' );
		expect( onErrorChange ).toHaveBeenCalledWith( ERROR_MESSAGES.INVALID_CHARACTERS );
	} );

	it( 'should show error state when validation fails for special characters only', () => {
		const onErrorChange = jest.fn();
		renderLabelField( { onErrorChange } );

		const input = screen.getByRole( 'textbox' );
		fireEvent.change( input, { target: { value: '_-_' } } );

		expect( screen.getByRole( 'textbox' ) ).toHaveClass( 'Mui-error' );
		expect( onErrorChange ).toHaveBeenCalledWith( ERROR_MESSAGES.NO_NON_SPECIAL_CHARACTER );
	} );

	it( 'should show error state when validation fails for exceeding max length', () => {
		const onErrorChange = jest.fn();
		renderLabelField( { onErrorChange } );

		const input = screen.getByRole( 'textbox' );
		const longValue = 'a'.repeat( VARIABLE_LABEL_MAX_LENGTH + 1 );
		fireEvent.change( input, { target: { value: longValue } } );

		expect( screen.getByRole( 'textbox' ) ).toHaveClass( 'Mui-error' );
		expect( onErrorChange ).toHaveBeenCalledWith( ERROR_MESSAGES.VARIABLE_LABEL_MAX_LENGTH );
	} );

	it( 'should not call onChange when new value equals error value', () => {
		const { props } = renderLabelField( {
			error: {
				value: 'duplicate',
				message: ERROR_MESSAGES.DUPLICATED_LABEL,
			},
		} );

		const input = screen.getByRole( 'textbox' );
		fireEvent.change( input, { target: { value: 'duplicate' } } );

		expect( props.onChange ).toHaveBeenCalledWith( '' );
	} );

	it( 'should focus input when focusOnShow is true', () => {
		renderLabelField( { focusOnShow: true } );

		const input = screen.getByRole( 'textbox' );
		expect( input ).toHaveFocus();
	} );

	it( 'should accept valid variable names', () => {
		const onErrorChange = jest.fn();
		renderLabelField( { onErrorChange } );

		const validNames = [ 'myVariable', 'my-variable', 'my_variable', 'my-variable-123', 'a1' ];

		const input = screen.getByRole( 'textbox' );

		validNames.forEach( ( name ) => {
			fireEvent.change( input, { target: { value: name } } );
			expect( onErrorChange ).toHaveBeenLastCalledWith( '' );
			expect( screen.getByRole( 'textbox' ) ).not.toHaveClass( 'Mui-error' );
		} );
	} );
} );

describe( 'useLabelError', () => {
	it( 'should initialize with default empty error state', () => {
		const { result } = renderHook( () => useLabelError() );
		expect( result.current.labelFieldError ).toEqual( {
			value: '',
			message: '',
		} );
	} );

	it( 'should initialize with provided error state', () => {
		const initialError = { value: 'test', message: 'error message' };
		const { result } = renderHook( () => useLabelError( initialError ) );
		expect( result.current.labelFieldError ).toEqual( initialError );
	} );

	it( 'should update error state using setLabelFieldError', () => {
		const { result } = renderHook( () => useLabelError() );
		const newError = { value: 'new', message: 'new error' };

		act( () => {
			result.current.setLabelFieldError( newError );
		} );

		expect( result.current.labelFieldError ).toEqual( newError );
	} );
} );
