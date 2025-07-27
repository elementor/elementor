import * as React from 'react';
import { createMockPropType, createMockSingleSizeFilterPropType, renderControl } from 'test-utils';
import {
	cssFilterFunctionPropUtil,
	filterPropTypeUtil,
	sizePropTypeUtil,
	stringPropTypeUtil,
} from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { FilterRepeaterControl } from '../filter-repeater-control';

const propType = createMockPropType( {
	kind: 'array',
	key: 'filter',
	default: null,
	meta: {},
	settings: {},
	item_prop_type: {
		kind: 'union',
		default: null,
		meta: {},
		settings: {},
		prop_types: {
			...createMockSingleSizeFilterPropType(),
		},
	},
} );

const mockFilter = filterPropTypeUtil.create( [
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'blur' ),
		args: sizePropTypeUtil.create( { size: 1, unit: 'px' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'brightness' ),
		args: sizePropTypeUtil.create( { size: 90, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'contrast' ),
		args: sizePropTypeUtil.create( { size: 50, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'grayscale' ),
		args: sizePropTypeUtil.create( { size: 70, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'invert' ),
		args: sizePropTypeUtil.create( { size: 60, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'sepia' ),
		args: sizePropTypeUtil.create( { size: 30, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'saturate' ),
		args: sizePropTypeUtil.create( { size: 25, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'hue-rotate' ),
		args: sizePropTypeUtil.create( { size: 10, unit: 'deg' } ),
	} ),
] );

describe( 'FilterRepeaterControl', () => {
	it( 'should render Filter repeater', () => {
		// Arrange.
		const props = { value: [], setValue: jest.fn(), bind: 'filter', propType };

		// Act.
		renderControl( <FilterRepeaterControl />, props );

		// Assert.
		const btn = screen.getAllByRole( 'button' )[ 0 ];
		expect( screen.getByText( 'Filters' ) ).toBeInTheDocument();
		expect( btn ).toHaveAttribute( 'aria-label', 'Add item' );
	} );

	it( 'should render Filter repeater for backdrop filter', () => {
		// Arrange.
		const props = {
			value: [],
			setValue: jest.fn(),
			bind: 'backdrop-filter',
			propType,
		};

		// Act.
		renderControl( <FilterRepeaterControl filterPropName="backdrop-filter" />, props );

		// Assert.
		const btn = screen.getAllByRole( 'button' )[ 0 ];
		expect( screen.getByText( 'Backdrop Filters' ) ).toBeInTheDocument();
		expect( btn ).toHaveAttribute( 'aria-label', 'Add item' );
	} );

	it( 'should render Filter repeater with items', () => {
		// Arrange.
		const props = { value: mockFilter, setValue: jest.fn(), bind: 'filter', propType };

		// Act.
		renderControl( <FilterRepeaterControl />, props );

		// Assert.
		expect( screen.getByText( 'Filters' ) ).toBeInTheDocument();

		expect( screen.getByText( 'blur:' ) ).toBeInTheDocument();
		expect( screen.getByText( '1px' ) ).toBeInTheDocument();

		expect( screen.getByText( 'brightness:' ) ).toBeInTheDocument();
		expect( screen.getByText( '90%' ) ).toBeInTheDocument();

		expect( screen.getByText( 'contrast:' ) ).toBeInTheDocument();
		expect( screen.getByText( '50%' ) ).toBeInTheDocument();

		expect( screen.getByText( 'grayscale:' ) ).toBeInTheDocument();
		expect( screen.getByText( '70%' ) ).toBeInTheDocument();

		expect( screen.getByText( 'invert:' ) ).toBeInTheDocument();
		expect( screen.getByText( '60%' ) ).toBeInTheDocument();

		expect( screen.getByText( 'sepia:' ) ).toBeInTheDocument();
		expect( screen.getByText( '30%' ) ).toBeInTheDocument();

		expect( screen.getByText( 'saturate:' ) ).toBeInTheDocument();
		expect( screen.getByText( '25%' ) ).toBeInTheDocument();

		expect( screen.getByText( 'hue-rotate:' ) ).toBeInTheDocument();
		expect( screen.getByText( '10deg' ) ).toBeInTheDocument();
	} );

	it( 'should show an add control when clicking on the add button', () => {
		// Arrange.
		const props = { value: mockFilter, setValue: jest.fn(), bind: 'filter', propType };

		// Act.
		renderControl( <FilterRepeaterControl />, props );
		const btn = screen.getAllByRole( 'button' )[ 0 ];
		fireEvent.click( btn );

		// Assert.
		expect( screen.getByText( 'Filters' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Filter' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Radius' ) ).toBeInTheDocument();
	} );
} );
