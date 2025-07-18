import * as React from 'react';
import { createMockPropType, createMockPropUtil, createMockSchema, renderControl } from 'test-utils';
import { type SizePropValue, type TransformablePropValue } from '@elementor/editor-props';
import { fireEvent, screen, within } from '@testing-library/react';

import { type EqualUnequalItems, EqualUnequalSizesControl } from '../equal-unequal-sizes-control';

const mockPropType = 'mock-prop-value';

type MockKeys = 'a' | 'b' | 'c' | 'd';
type MockPropValueType = TransformablePropValue< typeof mockPropType, Record< MockKeys, SizePropValue > >;

const mockLabel = 'Test';
const mockTooltipLabel = mockLabel;
const mockToggleIcon = <>Open Popover</>;
const mockItems: EqualUnequalItems = [
	{
		label: 'A label',
		icon: <>A icon</>,
		bind: 'a',
	},
	{
		label: 'B label',
		icon: <>B icon</>,
		bind: 'b',
	},
	{
		label: 'C label',
		icon: <>C icon</>,
		bind: 'c',
	},
	{
		label: 'D label',
		icon: <>D icon</>,
		bind: 'd',
	},
];

const mockBind = 'mock-bind';

const mockEqualValues: MockPropValueType = {
	$$type: mockPropType,
	value: {
		a: {
			$$type: 'size',
			value: { size: 5, unit: 'px' },
		},
		b: {
			$$type: 'size',
			value: { size: 5, unit: 'px' },
		},
		c: {
			$$type: 'size',
			value: { size: 5, unit: 'px' },
		},
		d: {
			$$type: 'size',
			value: { size: 5, unit: 'px' },
		},
	},
};

const mockMixedValues: MockPropValueType = {
	$$type: mockPropType,
	value: {
		a: {
			$$type: 'size',
			value: { size: 5, unit: 'px' },
		},
		b: {
			$$type: 'size',
			value: { size: 10, unit: 'px' },
		},
		c: {
			$$type: 'size',
			value: { size: 5, unit: 'px' },
		},
		d: {
			$$type: 'size',
			value: { size: 5, unit: 'px' },
		},
	},
};

const mockPropTypeUtil = createMockPropUtil(
	mockPropType,
	createMockSchema( 'object', {
		a: createMockSchema( 'any' ),
		b: createMockSchema( 'any' ),
		c: createMockSchema( 'any' ),
		d: createMockSchema( 'any' ),
	} )
);

const MockControl = () => (
	<EqualUnequalSizesControl
		label={ mockLabel }
		items={ mockItems }
		icon={ mockToggleIcon }
		tooltipLabel={ mockTooltipLabel }
		multiSizePropTypeUtil={ mockPropTypeUtil as never }
	/>
);

const propType = createMockPropType( {
	kind: 'union',
	prop_types: {
		size: createMockPropType( {
			kind: 'object',
			shape: {
				size: createMockPropType( { kind: 'plain' } ),
				unit: createMockPropType( { kind: 'plain' } ),
			},
		} ),
		[ mockPropType ]: createMockPropType( {
			kind: 'object',
			shape: {
				a: createMockPropType( { kind: 'object' } ),
				b: createMockPropType( { kind: 'object' } ),
				c: createMockPropType( { kind: 'object' } ),
				d: createMockPropType( { kind: 'object' } ),
			},
		} ),
	},
} );

describe( 'EqualUnequalSizeControl', () => {
	it( 'should render the label, and toggle icon, as well as all items clock-wise', () => {
		// Arrange.
		const setValue = jest.fn();

		// Act.
		renderControl( <MockControl />, { value: mockEqualValues, setValue, bind: mockBind, propType } );

		const controlIcon = screen.getByText( 'Open Popover' );
		fireEvent.click( controlIcon );

		// Assert.
		const controlLabel = screen.getByText( mockLabel );
		expect( controlLabel ).toBeInTheDocument();
		expect( controlIcon ).toBeInTheDocument();

		mockItems.forEach( ( item ) => {
			const label = screen.getByText( item.label );
			const icon = screen.getByText( `${ item.bind.toUpperCase() } icon` );
			expect( label ).toBeInTheDocument();
			expect( icon ).toBeInTheDocument();
		} );
	} );

	it( 'should switch from multi to single value when all values are equal', () => {
		// Arrange.
		const setValue = jest.fn();

		// Act.
		renderControl( <MockControl />, { value: mockMixedValues, setValue, bind: mockBind, propType } );

		const controlIcon = screen.getByText( 'Open Popover' );
		fireEvent.click( controlIcon );

		const popover = screen.getByRole( 'presentation', { hidden: true } );
		const input = within( popover ).getAllByRole( 'spinbutton', { hidden: true } )[ 1 ];
		fireEvent.change( input, { target: { value: 5 } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 5, unit: 'px' } } );
	} );

	it( 'should render the main field with MIXED as its value when not all values are equal', () => {
		// Arrange.
		const setValue = jest.fn();

		// Act.
		renderControl( <MockControl />, { value: mockMixedValues, setValue, bind: mockBind, propType } );

		// Assert.
		const controlAllField = screen.getByRole( 'spinbutton' );

		expect( controlAllField ).toHaveAttribute( 'placeholder', 'Mixed' );
		expect( controlAllField ).toHaveValue( null );
	} );

	it( 'should render the main field with no placeholder if the value is empty', () => {
		// Arrange.
		const setValue = jest.fn();

		// Act.
		renderControl( <MockControl />, { value: null, setValue, bind: mockBind, propType } );

		// Assert.
		const controlAllField = screen.getByRole( 'spinbutton' );

		expect( controlAllField ).not.toHaveAttribute( 'placeholder', 'Mixed' );
		expect( controlAllField ).toHaveValue( null );
	} );

	it( 'should set all values as the main value when changed from within the main field', () => {
		// Arrange.
		const setValue = jest.fn();

		// Act.
		renderControl( <MockControl />, { value: null, setValue, bind: mockBind, propType } );

		const controlAllField = screen.getByRole( 'spinbutton' );
		fireEvent.change( controlAllField, { target: { value: 5 } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 5, unit: 'px' } } );
	} );

	it( 'should open a popover when clicking on the icon', () => {
		// Arrange.
		const setValue = jest.fn();

		// Act.
		renderControl( <MockControl />, { value: mockEqualValues, setValue, bind: mockBind, propType } );

		const controlIcon = screen.getByText( 'Open Popover' );
		fireEvent.click( controlIcon );

		const popover = screen.getByRole( 'presentation', { hidden: true } );
		const popoverInputs = within( popover ).getAllByRole( 'spinbutton', { hidden: true } );

		// Assert.
		popoverInputs.forEach( ( input ) => {
			expect( input ).toHaveValue( 5 );
		} );
	} );

	it( 'should change the corresponding nested prop when changing a value from the popover', () => {
		// Arrange.
		const setValue = jest.fn();

		// Act.
		renderControl( <MockControl />, { value: mockEqualValues, setValue, bind: mockBind, propType } );

		const controlIcon = screen.getByText( 'Open Popover' );
		fireEvent.click( controlIcon );

		const popover = screen.getByRole( 'presentation', { hidden: true } );
		const input = within( popover ).getAllByRole( 'spinbutton', { hidden: true } )[ 1 ];
		fireEvent.change( input, { target: { value: 10 } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: mockPropType,
			value: {
				a: { $$type: 'size', value: { size: 5, unit: 'px' } },
				b: { $$type: 'size', value: { size: 10, unit: 'px' } },
				c: { $$type: 'size', value: { size: 5, unit: 'px' } },
				d: { $$type: 'size', value: { size: 5, unit: 'px' } },
			},
		} );
	} );

	it( 'should change the general value to size if nested props are equal', () => {
		// Arrange.
		const setValue = jest.fn();

		// Act.
		renderControl( <MockControl />, { value: mockMixedValues, setValue, bind: mockBind, propType } );

		const controlIcon = screen.getByText( 'Open Popover' );
		fireEvent.click( controlIcon );

		const popover = screen.getByRole( 'presentation', { hidden: true } );
		const input = within( popover ).getAllByRole( 'spinbutton', { hidden: true } )[ 1 ];
		fireEvent.change( input, { target: { value: 5 } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 5, unit: 'px' } } );
	} );

	it( 'should show a single value in the main field and set with multi sizes when a nested value is changed', () => {
		// Arrange.
		const setValue = jest.fn();

		const mockSingleValue: SizePropValue = {
			$$type: 'size',
			value: {
				size: 5,
				unit: 'px',
			},
		};

		// Act.
		renderControl( <MockControl />, { value: mockSingleValue, setValue, bind: mockBind, propType } );

		const controlAllField = screen.getByRole( 'spinbutton' );
		expect( controlAllField ).toHaveValue( 5 );

		const controlIcon = screen.getByText( 'Open Popover' );
		fireEvent.click( controlIcon );

		const popover = screen.getByRole( 'presentation', { hidden: true } );
		const input = within( popover ).getAllByRole( 'spinbutton', { hidden: true } )[ 1 ];
		fireEvent.change( input, { target: { value: 10 } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: mockPropType,
			value: {
				a: { $$type: 'size', value: { size: 5, unit: 'px' } },
				b: { $$type: 'size', value: { size: 10, unit: 'px' } },
				c: { $$type: 'size', value: { size: 5, unit: 'px' } },
				d: { $$type: 'size', value: { size: 5, unit: 'px' } },
			},
		} );
	} );

	it( 'should be able to set partial mixed values', () => {
		// Arrange.
		const setValue = jest.fn();

		// Act.
		renderControl( <MockControl />, { value: null, setValue, bind: mockBind, propType } );

		const controlIcon = screen.getByText( 'Open Popover' );
		fireEvent.click( controlIcon );

		const popover = screen.getByRole( 'presentation', { hidden: true } );
		const input = within( popover ).getAllByRole( 'spinbutton', { hidden: true } )[ 1 ];
		fireEvent.change( input, { target: { value: 5 } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: mockPropType,
			value: {
				b: { $$type: 'size', value: { size: 5, unit: 'px' } },
			},
		} );
	} );
} );
