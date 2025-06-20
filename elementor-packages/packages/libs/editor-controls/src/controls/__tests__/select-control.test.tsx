import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { SelectControl } from '../select-control';

const propType = createMockPropType( { kind: 'plain' } );

describe( 'SelectControl', () => {
	it( 'should pass the updated payload when select value changes', () => {
		// Arrange.
		const setValue = jest.fn();
		const options = [
			{ label: 'Option 1', value: 'value1' },
			{ label: 'Option 2', value: 'value2' },
		];

		const props = { setValue, value: { $$type: 'string', value: 'value1' }, bind: 'tag', propType };

		// Act.
		renderControl( <SelectControl options={ options } />, props );

		const select = screen.getByRole( 'combobox' );

		// Assert.
		expect( screen.getByText( 'Option 1' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Option 2' ) ).not.toBeInTheDocument();

		// Act.
		fireEvent.mouseDown( select );

		const option2 = screen.getByText( 'Option 2' );

		fireEvent.click( option2 );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'value2',
		} );
	} );

	it( 'should disable the select options', () => {
		// Arrange.
		const setValue = jest.fn();
		const options = [
			{ label: 'Option 1', value: 'value1' },
			{ label: 'Option 2', value: 'value2', disabled: true },
			{ label: 'Option 3', value: 'value3', disabled: false },
		];

		const props = { setValue, value: { $$type: 'string', value: 'value1' }, bind: 'tag', propType };

		// Act.
		renderControl( <SelectControl options={ options } />, props );

		const select = screen.getByRole( 'combobox' );

		// Act.
		fireEvent.mouseDown( select );

		const option2 = screen.getByRole( 'option', { name: 'Option 2' } );
		const option3 = screen.getByRole( 'option', { name: 'Option 3' } );

		// Assert.
		expect( option2 ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( option3 ).not.toHaveAttribute( 'aria-disabled', 'true' );
	} );
} );
