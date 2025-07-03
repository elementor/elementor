import * as React from 'react';
import { createMockPropType, createMockSingleSizeFilterPropType, renderControl } from 'test-utils';
import {
	blurFilterPropTypeUtil,
	brightnessFilterPropTypeUtil,
	contrastFilterPropTypeUtil,
	filterPropTypeUtil,
	grayscaleFilterPropTypeUtil,
	hueRotateFilterPropTypeUtil,
	invertFilterPropTypeUtil,
	saturateFilterPropTypeUtil,
	sepiaFilterPropTypeUtil,
	sizePropTypeUtil,
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
			...createMockSingleSizeFilterPropType( 'blur', 'radius', [
				'px',
				'em',
				'rem',
				'%',
				'vh',
				'vw',
				'vmin',
				'vmax',
			] ),
			...createMockSingleSizeFilterPropType( 'brightness', 'amount', [ '%' ] ),
			...createMockSingleSizeFilterPropType( 'contrast', 'contrast', [ '%' ] ),
			...createMockSingleSizeFilterPropType( 'grayscale', 'grayscale', [ '%' ] ),
			...createMockSingleSizeFilterPropType( 'invert', 'invert', [ '%' ] ),
			...createMockSingleSizeFilterPropType( 'sepia', 'sepia', [ '%' ] ),
			...createMockSingleSizeFilterPropType( 'saturate', 'saturate', [ '%' ] ),
			...createMockSingleSizeFilterPropType( 'hue-rotate', 'hue-rotate', [ 'deg', 'rad', 'grad', 'turn' ] ),
		},
	},
} );

const mockFilter = filterPropTypeUtil.create( [
	blurFilterPropTypeUtil.create( {
		radius: sizePropTypeUtil.create( { size: 1, unit: 'px' } ),
	} ),
	brightnessFilterPropTypeUtil.create( {
		amount: sizePropTypeUtil.create( { size: 90, unit: '%' } ),
	} ),
	contrastFilterPropTypeUtil.create( {
		contrast: sizePropTypeUtil.create( { size: 50, unit: '%' } ),
	} ),
	grayscaleFilterPropTypeUtil.create( {
		grayscale: sizePropTypeUtil.create( { size: 70, unit: '%' } ),
	} ),
	invertFilterPropTypeUtil.create( {
		invert: sizePropTypeUtil.create( { size: 60, unit: '%' } ),
	} ),
	sepiaFilterPropTypeUtil.create( {
		sepia: sizePropTypeUtil.create( { size: 30, unit: '%' } ),
	} ),
	saturateFilterPropTypeUtil.create( {
		saturate: sizePropTypeUtil.create( { size: 25, unit: '%' } ),
	} ),
	hueRotateFilterPropTypeUtil.create( {
		'hue-rotate': sizePropTypeUtil.create( { size: 10, unit: 'deg' } ),
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
		expect( screen.getByText( 'Filter' ) ).toBeInTheDocument();
		expect( btn ).toHaveAttribute( 'aria-label', 'Add item' );
	} );

	it( 'should render Filter repeater with items', () => {
		// Arrange.
		const props = { value: mockFilter, setValue: jest.fn(), bind: 'filter', propType };

		// Act.
		renderControl( <FilterRepeaterControl />, props );

		// Assert.
		expect( screen.getByText( 'Filter' ) ).toBeInTheDocument();

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
		expect( screen.getAllByText( 'Filter' ).length ).toBe( 2 );
		expect( screen.getByText( 'Radius' ) ).toBeInTheDocument();
	} );
} );
