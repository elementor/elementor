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

	it( 'should ignore restricted keys on size input', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = { setValue, value: { $$type: 'number', value: 7 }, bind: 'number', propType };

		// Act.
		renderControl( <NumberControl />, props );

		const input = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.keyDown( input, { key: 'e' } );
		fireEvent.keyDown( input, { key: 'E' } );
		fireEvent.keyDown( input, { key: '-' } );
		fireEvent.keyDown( input, { key: '+' } );

		// Assert.
		expect( setValue ).not.toHaveBeenCalled();
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
} );
