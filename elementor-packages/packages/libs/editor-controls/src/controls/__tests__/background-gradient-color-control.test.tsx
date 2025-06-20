import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import type { BackgroundGradientOverlayPropValue, ColorStopPropValue } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { BackgroundGradientColorControl } from '../background-control/background-gradient-color-control';

export const gradientPropType = createMockPropType( {
	kind: 'object',
	shape: {
		type: createMockPropType( { kind: 'plain' } ),
		angle: createMockPropType( { kind: 'plain' } ),
		positions: createMockPropType( { kind: 'plain' } ),
		stops: createMockPropType( {
			kind: 'array',
			item_prop_type: createMockPropType( {
				kind: 'object',
				shape: {
					color: createMockPropType( { kind: 'plain' } ),
					offset: createMockPropType( { kind: 'plain' } ),
				},
			} ),
		} ),
	},
} );

export const createMockGradientOverlay = (): BackgroundGradientOverlayPropValue => ( {
	$$type: 'background-gradient-overlay',
	value: {
		type: {
			$$type: 'string',
			value: 'linear',
		},
		angle: {
			$$type: 'number',
			value: 200,
		},
		stops: {
			$$type: 'gradient-color-stop',
			value: [
				{
					$$type: 'color-stop',
					value: {
						color: {
							$$type: 'color',
							value: 'rgb(20,30,20)',
						},
						offset: {
							$$type: 'number',
							value: 93,
						},
					},
				},
				{
					$$type: 'color-stop',
					value: {
						color: {
							$$type: 'color',
							value: 'rgb(255,0,0)',
						},
						offset: {
							$$type: 'number',
							value: 45,
						},
					},
				},
				{
					$$type: 'color-stop',
					value: {
						color: {
							$$type: 'color',
							value: 'red',
						},
						offset: {
							$$type: 'number',
							value: 25,
						},
					},
				},
			],
		},
	},
} );

describe( 'BackgroundGradientOverlay', () => {
	it( 'should switch to radial gradient', () => {
		// Arrange.
		const setValue = jest.fn();
		const value = createMockGradientOverlay();

		const props = {
			setValue,
			value,
			bind: 'background-gradient-overlay',
			propType: gradientPropType,
		};

		// Act.
		renderControl( <BackgroundGradientColorControl />, props );

		const select = screen.getByRole( 'combobox' );

		fireEvent.mouseDown( select );

		const radialOption = screen.getByText( 'Radial' );

		fireEvent.click( radialOption );

		const updatedMockValue = {
			...value,
			value: {
				...value.value,
				type: {
					$$type: 'string',
					value: 'radial',
				},
				positions: {
					$$type: 'string',
					value: 'center center',
				},
			},
		};

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( updatedMockValue );
	} );

	it( 'should set transparent color after removing color from color stop input', () => {
		// Arrange.
		const setValue = jest.fn();
		const value = createMockGradientOverlay();

		const props = {
			setValue,
			value,
			bind: 'background-gradient-overlay',
			propType: gradientPropType,
		};

		// Act.
		renderControl( <BackgroundGradientColorControl />, props );

		expect( screen.getByText( 'Color' ) ).toBeInTheDocument();

		const colorInput = screen.getAllByDisplayValue( 'rgb(20,30,20)' )[ 0 ];
		const stopInput = screen.getAllByDisplayValue( '93' )[ 0 ];

		fireEvent.change( colorInput, { target: { value: '' } } );
		fireEvent.change( stopInput, { target: { value: '' } } );

		const updatedMockValue = {
			...value,
			value: {
				...value.value,
				stops: {
					$$type: 'gradient-color-stop',
					value: value.value.stops.value.map( ( stop: ColorStopPropValue, index: number ) =>
						index === 0
							? {
									...stop,
									value: {
										...stop.value,
										color: {
											$$type: 'color',
											value: 'transparent',
										},
									},
							  }
							: stop
					),
				},
			},
		};

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( updatedMockValue );
	} );
} );
