import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { transitionProperties } from '../data';
import { SelectionSizeControl } from '../selection-size-control';
import { TransitionSelector } from '../transition-selector';

const propType = createMockPropType( {
	kind: 'object',
	key: 'selection-size',
	shape: {
		selection: createMockPropType( {
			kind: 'object',
			key: 'key-value',
			shape: {
				key: createMockPropType( { kind: 'plain' } ),
				value: createMockPropType( { kind: 'plain' } ),
			},
		} ),
		size: createMockPropType( {
			kind: 'object',
			shape: {
				size: createMockPropType( { kind: 'plain' } ),
				unit: createMockPropType( { kind: 'plain' } ),
			},
		} ),
	},
} );

// Use actual transition properties from data file
const TRANSITION_PROPERTIES = transitionProperties[ 0 ].properties.slice( 0, 3 ); // First 3 for testing

// Duration config for transitions (not opacity)
const DURATION_CONFIG = {
	variant: 'time' as const,
	units: [ 's', 'ms' ] as ( 's' | 'ms' )[],
	defaultUnit: 'ms' as const,
};

const TEST_PROPS = {
	selectionLabel: 'Type',
	sizeLabel: 'Duration',
	selectionConfig: {
		component: TransitionSelector as unknown as React.ComponentType< Record< string, unknown > >,
		props: {},
	},
	sizeConfigMap: {
		// Create size config for transition properties
		...TRANSITION_PROPERTIES.reduce(
			( acc, property ) => {
				acc[ property.value ] = DURATION_CONFIG;
				return acc;
			},
			{} as Record< string, typeof DURATION_CONFIG >
		),
	},
};

describe( 'SelectionSizeControl', () => {
	it( 'should render with selection and size components and output correct data structure', () => {
		// Arrange
		const setValue = jest.fn();
		const value = {
			$$type: 'selection-size',
			value: {
				selection: {
					$$type: 'key-value',
					value: {
						key: { $$type: 'string', value: 'all' },
						value: { $$type: 'string', value: 'All properties' },
					},
				},
				size: { $$type: 'size', value: { size: 200, unit: 'ms' } },
			},
		};
		const props = { setValue, value, bind: 'test', propType };

		// Act
		renderControl( <SelectionSizeControl { ...TEST_PROPS } />, props );

		// Assert
		expect( screen.getByText( 'Type' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Duration' ) ).toBeInTheDocument();
		expect( screen.getByText( 'All properties' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'spinbutton' ) ).toHaveValue( 200 );
	} );

	it( 'should display updated selection value when value changes', () => {
		const setValue = jest.fn();
		const initialValue = {
			$$type: 'selection-size',
			value: {
				selection: {
					$$type: 'key-value',
					value: {
						key: { $$type: 'string', value: 'all' },
						value: { $$type: 'string', value: 'All properties' },
					},
				},
				size: { $$type: 'size', value: { size: 200, unit: 'ms' } },
			},
		};
		const updatedValue = {
			$$type: 'selection-size',
			value: {
				selection: {
					$$type: 'key-value',
					value: {
						key: { $$type: 'string', value: 'opacity' },
						value: { $$type: 'string', value: 'Opacity' },
					},
				},
				size: { $$type: 'size', value: { size: 200, unit: 'ms' } },
			},
		};
		const props = { setValue, value: initialValue, bind: 'test', propType };

		renderControl( <SelectionSizeControl { ...TEST_PROPS } />, props );

		expect( screen.getByText( 'All properties' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Opacity' ) ).not.toBeInTheDocument();

		setValue( updatedValue );

		// Rerender with updated value
		renderControl( <SelectionSizeControl { ...TEST_PROPS } />, { ...props, value: updatedValue } );

		// Assert updated state
		expect( screen.getByText( 'Opacity' ) ).toBeInTheDocument();
	} );

	it( 'should update size value and preserve selection when size input changes', () => {
		// Arrange
		const setValue = jest.fn();
		const value = {
			$$type: 'selection-size',
			value: {
				selection: {
					$$type: 'key-value',
					value: {
						key: { $$type: 'string', value: 'all' },
						value: { $$type: 'string', value: 'All properties' },
					},
				},
				size: { $$type: 'size', value: { size: 200, unit: 'ms' } },
			},
		};
		const props = { setValue, value, bind: 'test', propType };

		// Act
		renderControl( <SelectionSizeControl { ...TEST_PROPS } />, props );

		const sizeInput = screen.getByRole( 'spinbutton' );
		fireEvent.change( sizeInput, { target: { value: '500' } } );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'selection-size',
			value: {
				selection: {
					$$type: 'key-value',
					value: {
						key: { $$type: 'string', value: 'all' },
						value: { $$type: 'string', value: 'All properties' },
					},
				},
				size: { $$type: 'size', value: { size: 500, unit: 'ms' } },
			},
		} );
	} );

	it( 'should not show size control when no config exists for selected property', () => {
		// Arrange
		const setValue = jest.fn();
		const value = {
			$$type: 'selection-size',
			value: {
				selection: {
					$$type: 'key-value',
					value: {
						key: { $$type: 'string', value: 'unknown-property' },
						value: { $$type: 'string', value: 'Unknown Property' },
					},
				},
				size: { $$type: 'size', value: { size: 200, unit: 'ms' } },
			},
		};
		const props = { setValue, value, bind: 'test', propType };

		// Act
		renderControl( <SelectionSizeControl { ...TEST_PROPS } />, props );

		// Assert
		expect( screen.getByText( 'Type' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Duration' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'spinbutton' ) ).not.toBeInTheDocument();
	} );
} );
