import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { UrlControl } from '@elementor/editor-controls';
import { fireEvent, screen } from '@testing-library/react';

const propType = createMockPropType( { kind: 'plain' } );

describe( 'UrlControl', () => {
	it( 'should pass the updated payload when input url value changes', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = { setValue, value: { $$type: 'url', value: 'https://elementor.com' }, bind: 'text', propType };

		// Act.
		renderControl( <UrlControl placeholder="Type or paste your URL" />, props );

		const input = screen.getByRole( 'textbox' );

		// Assert.
		expect( input ).toHaveValue( 'https://elementor.com' );

		// Act.
		fireEvent.input( input, { target: { value: 'https://my.elementor.com' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'url',
			value: 'https://my.elementor.com',
		} );
	} );
} );
