import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { GapControl } from '../gap-control';

const propType = createMockPropType( {
	kind: 'object',
	shape: {
		column: createMockPropType( { kind: 'object' } ),
		row: createMockPropType( { kind: 'object' } ),
	},
} );

describe( 'GapControl', () => {
	it( 'should render the gap control with its props', () => {
		// Arrange.
		const setValue = jest.fn();
		const bind = 'gap';
		const label = 'Gaps';
		const mockValue = {
			$$type: 'layout-direction',
			value: {
				column: { $$type: 'size', value: { unit: 'px', size: 10 } },
				row: { $$type: 'size', value: { unit: 'px', size: 10 } },
			},
		};
		const props = { setValue, value: mockValue, bind, propType };

		// Act.
		renderControl( <GapControl label={ label } />, props );

		// Assert.
		const controlLabel = screen.getByText( label ),
			toggleButton = screen.getByRole( 'button', { name: 'Link gaps' } );

		expect( controlLabel ).toHaveTextContent( label );
		expect( toggleButton ).toHaveAttribute( 'aria-pressed', 'false' );
	} );

	it( 'should call the setValue function with the correct value when linking', () => {
		// Arrange.
		const setValue = jest.fn();
		const bind = 'gap';
		const label = 'Gaps';

		const mockValue = {
			$$type: 'layout-direction',
			value: {
				column: { $$type: 'size', value: { unit: 'px', size: 100 } },
				row: { $$type: 'size', value: { unit: 'px', size: 0 } },
			},
		};

		const props = { setValue, value: mockValue, bind, propType };

		renderControl( <GapControl label={ label } />, props );

		const toggleButton = screen.getByRole( 'button', { name: 'Link gaps' } );

		// Act.
		fireEvent.click( toggleButton );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'size',
			value: { unit: 'px', size: 100 },
		} );
	} );

	it( 'should call the setValue function with the correct value when unlinking', () => {
		// Arrange.
		const setValue = jest.fn();
		const bind = 'gap';
		const label = 'Gaps';

		const mockValue = {
			$$type: 'size',
			value: {
				size: 100,
				unit: 'px',
			},
		};

		const props = { setValue, value: mockValue, bind, propType };

		renderControl( <GapControl label={ label } />, props );

		const toggleButton = screen.getByRole( 'button', { name: 'Unlink gaps' } );

		// Act.
		fireEvent.click( toggleButton );
		fireEvent.click( toggleButton );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'layout-direction',
			value: {
				column: { $$type: 'size', value: { unit: 'px', size: 100 } },
				row: { $$type: 'size', value: { unit: 'px', size: 100 } },
			},
		} );
	} );

	it( 'should change all values when linked', () => {
		// Arrange.
		const setValue = jest.fn();
		const bind = 'gap';
		const label = 'Gaps';

		const mockValue = {
			$$type: 'size',
			value: {
				size: 0,
				unit: 'px',
			},
		};

		const props = { setValue, value: mockValue, bind, propType };

		renderControl( <GapControl label={ label } />, props );

		const input = screen.getAllByRole( 'spinbutton' )[ 0 ];

		// Act.
		fireEvent.change( input, { target: { value: 100 } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'size',
			value: {
				size: 100,
				unit: 'px',
			},
		} );
	} );

	it( 'should change only one value when unlinked', () => {
		// Arrange.
		const setValue = jest.fn();
		const bind = 'gap';
		const label = 'Gaps';

		const mockValue = {
			$$type: 'layout-direction',
			value: {
				column: { $$type: 'size', value: { unit: 'px', size: 0 } },
				row: { $$type: 'size', value: { unit: 'px', size: 0 } },
			},
		};

		const props = { setValue, value: mockValue, bind, propType };

		renderControl( <GapControl label={ label } />, props );

		const input = screen.getAllByRole( 'spinbutton' )[ 0 ];

		// Act.
		fireEvent.change( input, { target: { value: 100 } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'layout-direction',
			value: {
				column: { $$type: 'size', value: { unit: 'px', size: 100 } },
				row: { $$type: 'size', value: { unit: 'px', size: 0 } },
			},
		} );
	} );

	it( 'should return undefined size props when clicking toggle link button with null layout direction props', () => {
		// Arrange.
		const setValue = jest.fn();
		const bind = 'gap';
		const label = 'Gaps';

		const props = {
			setValue,
			value: {
				$$type: 'layout-direction',
				value: {
					row: null,
					column: null,
				},
			},
			bind,
			propType,
		};

		renderControl( <GapControl label={ label } />, props );

		const toggleButton = screen.getByRole( 'button', { name: 'Link gaps' } );

		// Act.
		fireEvent.click( toggleButton );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( null );
	} );

	it( 'should return null layout direction props when clicking toggle link button with undefined size props', () => {
		// Arrange.
		const setValue = jest.fn();
		const bind = 'gap';
		const label = 'Gaps';

		const props = {
			setValue,
			value: {
				$$type: 'size',
				value: undefined,
			},
			bind,
			propType,
		};

		renderControl( <GapControl label={ label } />, props );

		const toggleButton = screen.getByRole( 'button', { name: 'Unlink gaps' } );

		// Act.
		fireEvent.click( toggleButton );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'layout-direction',
			value: {
				row: null,
				column: null,
			},
		} );
	} );
} );
