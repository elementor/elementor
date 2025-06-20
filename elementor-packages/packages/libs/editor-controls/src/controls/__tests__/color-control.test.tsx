import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { ColorControl } from '../color-control';

const propType = createMockPropType( { kind: 'plain' } );

describe( 'ColorControl', () => {
	it( 'should pass the updated payload when color value changes', () => {
		// Arrange.
		const setValue = jest.fn();
		const defaultHex = '#000000';
		const defaultValue = {
			$$type: 'color',
			value: defaultHex,
		};

		const props = { setValue, value: defaultValue, bind: 'color', propType };

		// Act.
		renderControl( <ColorControl />, props );

		// Act.
		const colorButton = screen.getByRole( 'button' );

		fireEvent.click( colorButton );

		// Assert.
		const colorInput = screen.getAllByDisplayValue( defaultHex )[ 0 ];
		expect( colorInput ).toHaveValue( defaultHex );

		// Act.
		fireEvent.change( colorInput, { target: { value: '#ffffff' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'color',
			value: '#ffffff',
		} );
	} );

	it( 'should have empty value when value is null', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = { setValue, value: { $$type: 'color', value: null }, bind: 'color', propType };

		// Act.
		renderControl( <ColorControl placeholder="color" />, props );

		const colorInput = screen.getByPlaceholderText( 'color' );

		// Assert.
		expect( colorInput ).toHaveValue( '' );
	} );
} );
