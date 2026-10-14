import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { type TextFieldProps } from '@elementor/ui';
import { fireEvent, screen } from '@testing-library/react';

import { NumberInput } from '../number-input';

describe( 'NumberInput', () => {
	const defaultProps = {
		value: 10,
		onChange: jest.fn(),
		type: 'number',
	};

	const getInput = () => screen.getByRole( 'spinbutton' );

	describe( 'onKeyDown behavior - should block restricted keys', () => {
		const restrictedKeys = [ 'e', 'E', '+' ];

		const onKeyDown = jest.fn();

		const setup = ( props: TextFieldProps = {} ) => {
			renderWithTheme( <NumberInput { ...defaultProps } onKeyDown={ onKeyDown } { ...props } /> );
		};

		const enterKey = ( key: string ) => {
			const input = getInput();
			fireEvent.keyDown( input, { key } );
		};

		const isDefaultPrevented = () => onKeyDown.mock.calls[ 0 ][ 0 ].defaultPrevented;

		it.each( restrictedKeys )( 'should prevent restricted input key "%s"', ( key ) => {
			// Arrange.
			setup();

			// Act.
			enterKey( key );

			// Assert.
			expect( isDefaultPrevented() ).toBe( true );
		} );

		it( 'should allow "-" when negative values are allowed - default', () => {
			// Arrange.
			setup();

			// Act.
			enterKey( '-' );

			// Assert.
			expect( isDefaultPrevented() ).toBe( false );
		} );

		it( 'should allow "-" when negative values are allowed - `inputProps.min` is less then 0', () => {
			// Arrange.
			setup( { inputProps: { min: -Number.MAX_SAFE_INTEGER } } );

			// Act.
			enterKey( '-' );

			// Assert.
			expect( isDefaultPrevented() ).toBe( false );
		} );

		it( 'should prevent "-" when negative values are not allowed', () => {
			// Arrange.
			setup( { inputProps: { min: 0 } } );

			// Act.
			enterKey( '-' );

			// Assert.
			expect( isDefaultPrevented() ).toBe( true );
		} );

		it( 'should call custom onKeyDown if provided', () => {
			// Arrange.
			const customOnKeyDown = jest.fn();
			setup( { onKeyDown: customOnKeyDown } );

			// Act.
			enterKey( '1' );

			// Assert.
			expect( customOnKeyDown ).toHaveBeenCalledWith( expect.objectContaining( { key: '1' } ) );
		} );
	} );

	describe( 'onBlur behavior - should re-render if input is invalid', () => {
		const onChange = jest.fn();
		const onBlur = jest.fn();

		const setup = ( props: TextFieldProps = {} ) => {
			renderWithTheme( <NumberInput { ...defaultProps } onChange={ onChange } onBlur={ onBlur } { ...props } /> );
		};

		const changeInputValue = ( value: string ) => {
			const input = getInput();
			fireEvent.change( input, { target: { value } } );
		};

		const setInputInvalid = () => {
			const input = getInput();
			Object.defineProperty( input, 'validity', {
				value: { valid: false },
				writable: true,
			} );
		};

		it( 'should trigger re-render when input is invalid', async () => {
			// Arrange.
			setup();

			const initialInput = getInput();

			// Act.
			changeInputValue( '30-' );
			setInputInvalid();

			fireEvent.blur( initialInput );

			// Assert.
			const newInput = getInput();
			expect( newInput ).not.toBe( initialInput );
		} );

		it( 'should not trigger re-render when input is valid', async () => {
			// Arrange.
			setup();

			const initialInput = getInput();

			// Act.
			changeInputValue( '30' );

			fireEvent.blur( initialInput );

			// Assert.
			const newInput = getInput();
			expect( newInput ).toBe( initialInput );
		} );

		it( 'should call custom onBlur if provided', () => {
			// Arrange.
			const customOnBlur = jest.fn();
			setup( { onBlur: customOnBlur } );

			// Act.
			fireEvent.blur( getInput() );

			// Assert.
			expect( customOnBlur ).toHaveBeenCalled();
		} );
	} );
} );
