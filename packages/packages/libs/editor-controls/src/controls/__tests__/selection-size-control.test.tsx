import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { SelectControl } from '../select-control';
import { SelectionSizeControl } from '../selection-size-control';

const propType = createMockPropType( {
	kind: 'object',
	key: 'selection-size',
	shape: {
		selection: createMockPropType( { kind: 'plain' } ),
		size: createMockPropType( {
			kind: 'object',
			shape: {
				size: createMockPropType( { kind: 'plain' } ),
				unit: createMockPropType( { kind: 'plain' } ),
			},
		} ),
	},
} );

// Generic color properties for testing (not transition-specific)
const COLOR_PROPERTIES = [
	{ label: 'Text Color', value: 'color' },
	{ label: 'Border Color', value: 'border-color' },
	{ label: 'Shadow Color', value: 'box-shadow' },
];

// Generic opacity config for testing
const OPACITY_CONFIG = {
	variant: 'length' as const,
	units: [ '%', 'px' ] as ( '%' | 'px' )[],
	defaultUnit: '%' as const,
};

const TEST_PROPS = {
	selectionLabel: 'Color Property',
	sizeLabel: 'Opacity',
	selectionConfig: {
		component: SelectControl as unknown as React.ComponentType< Record< string, unknown > >,
		props: {
			options: COLOR_PROPERTIES,
		},
	},
	sizeConfigMap: {
		color: OPACITY_CONFIG,
		'border-color': OPACITY_CONFIG,
		'box-shadow': OPACITY_CONFIG,
	},
};

describe( 'SelectionSizeControl', () => {
	it( 'should render with selection and size components and output correct data structure', () => {
		// Arrange
		const setValue = jest.fn();
		const value = {
			$$type: 'selection-size',
			value: {
				selection: { $$type: 'string', value: 'color' },
				size: { $$type: 'size', value: { size: 80, unit: '%' } },
			},
		};
		const props = { setValue, value, bind: 'test', propType };

		// Act
		renderControl( <SelectionSizeControl { ...TEST_PROPS } />, props );

		// Assert
		expect( screen.getByText( 'Color Property' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Opacity' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Text Color' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'spinbutton' ) ).toHaveValue( 80 );
	} );

	it( 'should update selection value and preserve size when dropdown changes', () => {
		// Arrange
		const setValue = jest.fn();
		const value = {
			$$type: 'selection-size',
			value: {
				selection: { $$type: 'string', value: 'color' },
				size: { $$type: 'size', value: { size: 80, unit: '%' } },
			},
		};
		const props = { setValue, value, bind: 'test', propType };

		// Act
		renderControl( <SelectionSizeControl { ...TEST_PROPS } />, props );

		const selectDropdown = screen.getByRole( 'combobox' );
		fireEvent.mouseDown( selectDropdown );

		const borderColorOption = screen.getByText( 'Border Color' );
		fireEvent.click( borderColorOption );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'selection-size',
			value: {
				selection: { $$type: 'string', value: 'border-color' },
				size: { $$type: 'size', value: { size: 80, unit: '%' } },
			},
		} );
	} );

	it( 'should update size value and preserve selection when size input changes', () => {
		// Arrange
		const setValue = jest.fn();
		const value = {
			$$type: 'selection-size',
			value: {
				selection: { $$type: 'string', value: 'color' },
				size: { $$type: 'size', value: { size: 80, unit: '%' } },
			},
		};
		const props = { setValue, value, bind: 'test', propType };

		// Act
		renderControl( <SelectionSizeControl { ...TEST_PROPS } />, props );

		const sizeInput = screen.getByRole( 'spinbutton' );
		fireEvent.change( sizeInput, { target: { value: '50' } } );

		// Assert
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'selection-size',
			value: {
				selection: { $$type: 'string', value: 'color' },
				size: { $$type: 'size', value: { size: 50, unit: '%' } },
			},
		} );
	} );
} );
