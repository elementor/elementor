import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { TextControl } from '../text-control';

const propType = createMockPropType( { kind: 'plain' } );

describe( 'TextControl', () => {
	it( 'should pass the updated payload when input value changes', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = { setValue, value: { $$type: 'string', value: 'Hi' }, bind: 'text', propType };

		// Act.
		renderControl( <TextControl placeholder="type text here" />, props );

		const input = screen.getByRole( 'textbox' );

		// Assert.
		expect( input ).toHaveValue( 'Hi' );

		// Act.
		fireEvent.input( input, { target: { value: 'OK Heading!' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'OK Heading!',
		} );
	} );

	it( 'should have empty value when value is null', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = { setValue, value: { $$type: 'string', value: null }, bind: 'text', propType };

		// Act.
		renderControl( <TextControl placeholder="type text here" />, props );

		const input = screen.getByRole( 'textbox' );

		// Assert.
		expect( input ).toHaveValue( '' );
	} );
} );
