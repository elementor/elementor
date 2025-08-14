import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NumberInput } from '../number-input';

describe( 'NumberInput', () => {
	const defaultProps = {
		value: 10,
		onChange: jest.fn(),
	};

	const getInput = () => screen.getByRole( 'spinbutton' );

	describe( 'Rendering', () => {
		it( 'should render with initial value', () => {
			renderWithTheme( <NumberInput { ...defaultProps } /> );

			const input = getInput();
			expect( input ).toHaveValue( 10 );
		} );

		it( 'should render with placeholder', () => {
			renderWithTheme( <NumberInput { ...defaultProps } placeholder="Enter number" /> );

			const input = screen.getByPlaceholderText( 'Enter number' );
			expect( input ).toBeInTheDocument();
		} );

		it( 'should render with empty value', () => {
			renderWithTheme( <NumberInput { ...defaultProps } value={ null } /> );

			const input = getInput();
			expect( input ).toHaveValue( null );
		} );
	} );

	describe( 'onKeyDown behavior - should block restricted keys', () => {
		it( 'should prevent restricted input keys', () => {
			const onKeyDown = jest.fn();
			renderWithTheme( <NumberInput { ...defaultProps } onKeyDown={ onKeyDown } /> );
			const input = getInput();

			const restrictedKeys = [ 'e', 'E', '+' ];

			restrictedKeys.forEach( ( key, index ) => {
				fireEvent.keyDown( input, { key } );
				expect( onKeyDown ).toHaveBeenNthCalledWith( index + 1,
					expect.objectContaining( { 
						key,
						defaultPrevented: true
					} ) 
				);
			} );
		} );

		it( 'should allow "." when decimal values are allowed - default', () => {
			const onKeyDown = jest.fn();
			renderWithTheme( <NumberInput { ...defaultProps } onKeyDown={ onKeyDown } /> );
			const input = getInput();

			fireEvent.keyDown( input, { key: '.' } );

			expect( onKeyDown ).toHaveBeenCalledWith( 
				expect.objectContaining( { 
					key: '.',
					defaultPrevented: false
				} ) 
			);
		} );

		it( 'should allow "." when decimal values are allowed - `step` prop is not an integer', () => {
			const onKeyDown = jest.fn();
			renderWithTheme( <NumberInput { ...defaultProps } step={ 0.1 } onKeyDown={ onKeyDown } /> );
			const input = getInput();

			fireEvent.keyDown( input, { key: '.' } );

			expect( onKeyDown ).toHaveBeenCalledWith( 
				expect.objectContaining( { 
					key: '.',
					defaultPrevented: false
				} ) 
			);
		} );

		it( 'should prevent "." when decimal values are not allowed - `step` prop is an integer', () => {
			const onKeyDown = jest.fn();
			renderWithTheme( <NumberInput { ...defaultProps } step={ 1 } onKeyDown={ onKeyDown } /> );
			const input = getInput();

			fireEvent.keyDown( input, { key: '.' } );

			expect( onKeyDown ).toHaveBeenCalledWith( 
				expect.objectContaining( { 
					key: '.',
					defaultPrevented: true
				} ) 
			);
		} );

		

		it( 'should prevent "-" when negative values are not allowed - default', () => {
			const onKeyDown = jest.fn();
			renderWithTheme( <NumberInput { ...defaultProps } onKeyDown={ onKeyDown } /> );
			const input = getInput();

			fireEvent.keyDown( input, { key: '-' } );

			expect( onKeyDown ).toHaveBeenCalledWith( 
				expect.objectContaining( { 
					key: '-',
					defaultPrevented: true
				} ) 
			);
		} );

		it( 'should allow "-" when negative values are allowed - `min` prop is negative', () => {
			const onKeyDown = jest.fn();
			renderWithTheme( <NumberInput { ...defaultProps } min={-Number.MAX_VALUE} onKeyDown={ onKeyDown } /> );
			const input = getInput();

			fireEvent.keyDown( input, { key: '-' } );

			expect( onKeyDown ).toHaveBeenCalledWith( 
				expect.objectContaining( { 
					key: '-',
					defaultPrevented: false
				} ) 
			);
		} );

		it( 'should call custom onKeyDown handler from inputProps', () => {
			const customOnKeyDown = jest.fn();
			renderWithTheme( <NumberInput { ...defaultProps } onKeyDown={ customOnKeyDown } /> );
			const input = getInput();

			fireEvent.keyDown( input, { key: '1' } );

			expect( customOnKeyDown ).toHaveBeenCalledWith( expect.objectContaining( { key: '1' } ) );
		} );
	} );

	describe( 'onChange behavior - should call onChange with formatted value, while keep showing the original value', () => {
		it( 'should call onChange with number value on valid input', () => {
			const onChange = jest.fn();
			renderWithTheme( <NumberInput { ...defaultProps } onChange={ onChange } /> );

			const input = getInput();
			fireEvent.change( input, { target: { value: '25' } } );

			expect( onChange ).toHaveBeenCalledWith( 25 );
		} );

		it( 'should call onChange with null on invalid input', () => {
			const onChange = jest.fn();
			renderWithTheme( <NumberInput { ...defaultProps } onChange={ onChange } /> );

			const input = getInput();
			fireEvent.change( input, { target: { value: '-9-' } } );

			expect( onChange ).toHaveBeenCalledWith( null );
		} );
	} );

	describe( 'onBlur behavior - should keep valid value or revert to last valid value on invalid input, for both internal and external states', () => {
		it( 'should keep valid value on blur', () => {
			const onChange = jest.fn();
			renderWithTheme( <NumberInput { ...defaultProps } onChange={ onChange } value={ 20 } /> );

			const input = getInput();
			fireEvent.change( input, { target: { value: '30' } } );
			fireEvent.blur( input );

			expect( input ).toHaveValue( 30 );
			expect( onChange ).toHaveBeenCalledWith( 30 );
		} );

		it( 'should revert to last valid value on invalid input', () => {
			const onChange = jest.fn();
			renderWithTheme( <NumberInput { ...defaultProps } onChange={ onChange } value={ 20 } /> );

			const input = getInput();
			// Simulate invalid input that would fail HTML5 validation
			Object.defineProperty( input, 'validity', {
				value: { valid: false },
				writable: true,
			} );

			fireEvent.change( input, { target: { value: '-9-' } } );
			fireEvent.blur( input );

			expect( input ).toHaveValue( 20 );
			expect( onChange ).toHaveBeenCalledWith( 20 );
		} );

		it( 'should use custom validate function on blur', () => {
			const onChange = jest.fn();
			const validate = jest.fn().mockReturnValue( false );
			renderWithTheme(
				<NumberInput { ...defaultProps } onChange={ onChange } validate={ validate } value={ 20 } />
			);

			const input = getInput();
			fireEvent.change( input, { target: { value: '30' } } );
			fireEvent.blur( input );

			expect( validate ).toHaveBeenCalledWith( 30 );
			 // Should revert to original value
			expect( input ).toHaveValue( 20 );
		} );

		it( 'should call custom onBlur handler from inputProps', () => {
			const onBlur = jest.fn();
			renderWithTheme( <NumberInput { ...defaultProps } inputProps={ { onBlur } } /> );

			const input = getInput();
			fireEvent.blur( input );

			expect( onBlur ).toHaveBeenCalled();
		} );
	} );

	describe( 'onFocus behavior', () => {
		it( 'should store current value as latest valid value on focus', () => {
			const onChange = jest.fn();
			renderWithTheme( <NumberInput { ...defaultProps } onChange={ onChange } value={ 20 } /> );

			const input = getInput();
			fireEvent.focus( input );

			// Change to invalid and blur to test if it reverts to the focused value
			Object.defineProperty( input, 'validity', {
				value: { valid: false },
				writable: true,
			} );
			fireEvent.change( input, { target: { value: 'invalid' } } );
			fireEvent.blur( input );

			expect( input ).toHaveValue( 20 );
		} );

		it( 'should call custom onFocus handler from inputProps', () => {
			const onFocus = jest.fn();
			renderWithTheme( <NumberInput { ...defaultProps } inputProps={ { onFocus } } /> );

			const input = getInput();
			fireEvent.focus( input );

			expect( onFocus ).toHaveBeenCalled();
		} );
	} );

	describe( 'Props forwarding', () => {
		it( 'should forward additional props to TextField', () => {
			renderWithTheme(
				<NumberInput { ...defaultProps } disabled placeholder="Test placeholder" data-testid="test-id" />
			);

			const input = getInput();
			const textField = screen.getByTestId( 'test-id' );
			
			expect( input ).toBeDisabled();
			expect( input ).toHaveAttribute( 'placeholder', 'Test placeholder' );
			expect( textField ).toBeInTheDocument();
		} );
	} );
} );
