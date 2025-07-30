import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { LinkedDimensionsControl } from '../linked-dimensions-control';

const propType = createMockPropType( {
	kind: 'union',
	prop_types: {
		size: createMockPropType( {
			key: 'size',
			kind: 'plain',
		} ),
		dimensions: createMockPropType( {
			kind: 'object',
			shape: {
				'block-start': createMockPropType( {
					kind: 'plain',
				} ),
				'block-end': createMockPropType( {
					kind: 'plain',
				} ),
				'inline-start': createMockPropType( {
					kind: 'plain',
				} ),
				'inline-end': createMockPropType( {
					kind: 'plain',
				} ),
			},
		} ),
	},
} );

describe( 'LinkedDimensionsControl', () => {
	it( 'should render the linked dimensions control with its props', () => {
		// Arrange.
		const setValue = jest.fn();
		const bind = 'padding';
		const label = 'Padding';

		const mockValue = null;

		const props = { setValue, value: mockValue, bind, propType };

		// Act.
		renderControl( <LinkedDimensionsControl label={ label } />, props );

		// Assert.
		const controlLabel = screen.getByText( label );
		const toggleButton = screen.getByRole( 'button', { name: 'Unlink padding' } );

		expect( controlLabel ).toHaveTextContent( label );
		expect( toggleButton ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should change all dimensions when linked', () => {
		// Arrange.
		const setValue = jest.fn();
		const bind = 'padding';
		const label = 'Padding';

		const mockValue = null;

		const props = { setValue, value: mockValue, bind, propType };

		// Act.
		renderControl( <LinkedDimensionsControl label={ label } />, props );

		const dimensionInput = screen.getAllByRole( 'spinbutton' )[ 0 ];

		// Act.
		fireEvent.change( dimensionInput, { target: { value: '10' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'size',
			value: { unit: 'px', size: 10 },
		} );
	} );

	it( 'should change one dimension when not linked', () => {
		// Arrange.
		const setValue = jest.fn();
		const bind = 'padding';
		const label = 'Padding';

		const mockValue = {
			$$type: 'dimensions',
			value: {
				'block-start': { $$type: 'size', value: { unit: 'px', size: 0 } },
				'block-end': { $$type: 'size', value: { unit: 'px', size: 0 } },
				'inline-start': { $$type: 'size', value: { unit: 'px', size: 0 } },
				'inline-end': { $$type: 'size', value: { unit: 'px', size: 0 } },
			},
		};

		const props = { setValue, value: mockValue, bind, propType };

		// Act.
		renderControl( <LinkedDimensionsControl label={ label } />, props );

		const dimensionInput = screen.getAllByRole( 'spinbutton' )[ 0 ];

		// Act.
		fireEvent.change( dimensionInput, { target: { value: '10' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'dimensions',
			value: {
				'block-start': { $$type: 'size', value: { unit: 'px', size: 10 } },
				'block-end': { $$type: 'size', value: { unit: 'px', size: 0 } },
				'inline-start': { $$type: 'size', value: { unit: 'px', size: 0 } },
				'inline-end': { $$type: 'size', value: { unit: 'px', size: 0 } },
			},
		} );
	} );

	it( 'should link all dimensions based on the top value when the link button is clicked', () => {
		// Arrange.
		const setValue = jest.fn();
		const bind = 'padding';
		const label = 'Padding';

		const mockValue = {
			$$type: 'dimensions',
			value: {
				'block-start': { $$type: 'size', value: { unit: 'px', size: 10 } },
				'block-end': { $$type: 'size', value: { unit: 'px', size: 30 } },
				'inline-start': { $$type: 'size', value: { unit: 'px', size: 40 } },
				'inline-end': { $$type: 'size', value: { unit: 'px', size: 20 } },
			},
		};

		const props = { setValue, value: mockValue, bind, propType };

		// Act.
		renderControl( <LinkedDimensionsControl label={ label } />, props );

		const toggleButton = screen.getByRole( 'button', { name: 'Link padding' } );

		// Act.
		fireEvent.click( toggleButton );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'size',
			value: { unit: 'px', size: 10 },
		} );
	} );
} );
