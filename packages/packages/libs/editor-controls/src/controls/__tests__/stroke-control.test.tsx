import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { StrokeControl } from '../stroke-control';

const propType = createMockPropType( {
	kind: 'object',
	key: 'image',
	shape: {
		color: createMockPropType( { kind: 'object' } ),
		width: createMockPropType( { kind: 'object' } ),
	},
} );

describe( 'StrokeControl', () => {
	it( 'should apply text-stroke when width is updated', () => {
		// Arrange.
		const setValue = jest.fn();
		const bind = '-webkit-text-stroke';

		const defaultHex = '000000';
		const defaultValue = {
			$$type: 'stroke',
			value: {
				color: {
					$$type: 'color',
					value: '#' + defaultHex,
				},
				width: {
					$$type: 'size',
					value: {
						unit: 'px',
						size: 1,
					},
				},
			},
		};

		const props = { value: defaultValue, setValue, bind, propType };

		// Act.
		renderControl( <StrokeControl />, props );

		// Assert.
		const widthInput = screen.getByRole( 'spinbutton' );

		fireEvent.click( widthInput );

		fireEvent.change( widthInput, { target: { value: '10' } } );

		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'stroke',
			value: {
				color: {
					$$type: 'color',
					value: '#' + defaultHex,
				},
				width: {
					$$type: 'size',
					value: {
						unit: 'px',
						size: 10,
					},
				},
			},
		} );
	} );

	it( 'should not allow incorrect stroke width input value', () => {
		// Arrange.
		const setValue = jest.fn();
		const bind = '-webkit-text-stroke';

		const defaultHex = '000000';
		const defaultValue = {
			$$type: 'stroke',
			value: {
				color: {
					$$type: 'color',
					value: '#' + defaultHex,
				},
				width: {
					$$type: 'size',
					value: {
						unit: 'px',
						size: 1,
					},
				},
			},
		};

		const props = { value: defaultValue, setValue, bind, propType };

		// Act.
		renderControl( <StrokeControl />, props );

		// Assert.
		const widthInput = screen.getByRole( 'spinbutton' );

		fireEvent.click( widthInput );

		fireEvent.change( widthInput, { target: { value: 'hot' } } );

		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'stroke',
			value: {
				color: {
					$$type: 'color',
					value: '#' + defaultHex,
				},
				width: null,
			},
		} );
	} );
} );
