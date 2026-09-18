import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { NumberControl } from '../number-control';

const propType = createMockPropType( { kind: 'plain' } );

describe( 'NumberControl', () => {
	it( 'should pass the updated payload when input value changes', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = { setValue, value: { $$type: 'number', value: 7 }, bind: 'number', propType };

		// Act.
		renderControl( <NumberControl placeholder={ 'Add number' } />, props );

		const input = screen.getByRole( 'spinbutton' );

		// Assert.
		expect( input ).toHaveValue( 7 );
		// Make sure props are passed correctly.
		expect( input ).toHaveAttribute( 'placeholder', 'Add number' );

		// Act.
		fireEvent.input( input, { target: { value: 8 } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'number',
			value: 8,
		} );
	} );

	it( 'should convert string to number when input value changes', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = { setValue, value: { $$type: 'number', value: 7 }, bind: 'number', propType };
		// Act.
		renderControl( <NumberControl />, props );

		const input = screen.getByRole( 'spinbutton' );

		// Assert.
		expect( input ).toHaveValue( 7 );

		// Act.
		fireEvent.input( input, { target: { value: '8' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'number',
			value: 8,
		} );
	} );

	it( 'should convert empty string to null when input value changes', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = { setValue, value: { $$type: 'number', value: 7 }, bind: 'number', propType };

		// Act.
		renderControl( <NumberControl />, props );

		const input = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.input( input, { target: { value: '' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( null );
	} );

	it( 'should use placeholder from NumberControl when both renderControl props and NumberControl have placeholder', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			value: { $$type: 'number', value: 5 },
			bind: 'number',
			propType,
			placeholder: { $$type: 'number', value: 123 },
		};

		// Act.
		renderControl( <NumberControl placeholder="Component placeholder" />, props );

		const input = screen.getByRole( 'spinbutton' );

		expect( input ).toHaveAttribute( 'placeholder', 'Component placeholder' );
	} );

	it( 'should use placeholder from renderControl props when NumberControl has no placeholder', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			value: { $$type: 'number', value: 5 },
			bind: 'number',
			propType,
			placeholder: { $$type: 'number', value: 123 },
		};

		// Act.
		renderControl( <NumberControl />, props );

		const input = screen.getByRole( 'spinbutton' );

		// Assert.
		expect( input ).toHaveAttribute( 'placeholder', '123' );
	} );

	it( 'should not clamp or commit while typing through an intermediate below-min value', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'number', value: 600 }, bind: 'number', propType };

		renderControl( <NumberControl min={ 100 } max={ 3000 } />, props );

		const input = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.input( input, { target: { value: '2' } } );

		// Assert.
		expect( input ).toHaveDisplayValue( '2' );
		expect( setValue ).not.toHaveBeenCalled();

		// Act.
		fireEvent.input( input, { target: { value: '20' } } );

		// Assert.
		expect( input ).toHaveDisplayValue( '20' );
		expect( setValue ).not.toHaveBeenCalled();

		// Act.
		fireEvent.input( input, { target: { value: '200' } } );

		// Assert.
		expect( input ).toHaveDisplayValue( '200' );
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'number', value: 200 } );
	} );

	it( 'should not rewrite or commit while typing a value above max', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'number', value: 3 }, bind: 'number', propType };

		renderControl( <NumberControl min={ 1 } max={ 100 } />, props );

		const input = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.input( input, { target: { value: '200' } } );

		// Assert — 200 is above max, so nothing is committed at all.
		expect( input ).toHaveDisplayValue( '200' );
		expect( setValue ).not.toHaveBeenCalled();
	} );

	it( 'should clamp to min on blur', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'number', value: 600 }, bind: 'number', propType };

		renderControl( <NumberControl min={ 100 } max={ 3000 } />, props );

		const input = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.input( input, { target: { value: '2' } } );
		fireEvent.blur( input );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'number', value: 100 } );
	} );

	it( 'should clamp to max on blur', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'number', value: 3 }, bind: 'number', propType };

		renderControl( <NumberControl min={ 1 } max={ 100 } />, props );

		const input = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.input( input, { target: { value: '200' } } );
		fireEvent.blur( input );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'number', value: 100 } );
	} );

	it( 'should keep the field empty while editing instead of restoring the prop default', () => {
		// Arrange.
		const propTypeWithDefault = createMockPropType( {
			kind: 'plain',
			default: { $$type: 'number', value: 600 },
		} );

		const setValue = jest.fn();
		const props = { setValue, bind: 'number', propType: propTypeWithDefault };

		renderControl( <NumberControl min={ 100 } max={ 3000 } />, props );

		const input = screen.getByRole( 'spinbutton' );

		// Assert.
		expect( input ).toHaveDisplayValue( '600' );

		// Act.
		fireEvent.input( input, { target: { value: '' } } );

		// Assert.
		expect( input ).toHaveDisplayValue( '' );
		expect( setValue ).toHaveBeenCalledWith( null );
	} );

	it( 'should commit a negative value when min allows it', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'number', value: 5 }, bind: 'number', propType };

		renderControl( <NumberControl min={ -100 } max={ 100 } />, props );

		const input = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.input( input, { target: { value: '-5' } } );

		// Assert.
		expect( input ).toHaveDisplayValue( '-5' );
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'number', value: -5 } );
	} );

	it( 'should display zero as a value rather than an empty field', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'number', value: 0 }, bind: 'number', propType };

		// Act.
		renderControl( <NumberControl min={ 0 } />, props );

		// Assert.
		expect( screen.getByRole( 'spinbutton' ) ).toHaveDisplayValue( '0' );
	} );

	it( 'should accept a decimal that violates the native step', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'number', value: 1 }, bind: 'number', propType };

		renderControl( <NumberControl step={ 0.1 } />, props );

		const input = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.input( input, { target: { value: '1.15' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'number', value: 1.15 } );
	} );

	it( 'should truncate to an integer when shouldForceInt is set', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'number', value: 2 }, bind: 'number', propType };

		renderControl( <NumberControl shouldForceInt min={ 0 } />, props );

		const input = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.input( input, { target: { value: '1.5' } } );

		// Assert.
		expect( input ).toHaveDisplayValue( '1.5' );
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'number', value: 1 } );
	} );

	it( 'should follow the bound value when it changes externally and the field is not being edited', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'number', value: 600 }, bind: 'number', propType };

		const { rerender } = renderControl( <NumberControl min={ 100 } max={ 3000 } />, props );

		// Assert.
		expect( screen.getByRole( 'spinbutton' ) ).toHaveDisplayValue( '600' );

		// Act.
		rerender( <NumberControl min={ 100 } max={ 3000 } />, {
			value: { number: { $$type: 'number', value: 900 } },
		} );

		// Assert.
		expect( screen.getByRole( 'spinbutton' ) ).toHaveDisplayValue( '900' );
	} );
} );
