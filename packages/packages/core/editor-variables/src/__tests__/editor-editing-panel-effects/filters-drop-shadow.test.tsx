import * as React from 'react';
import { createMockPropType, createMockSingleSizeFilterPropType, renderControl } from 'test-utils';
import { FilterRepeaterControl } from '@elementor/editor-controls';
import {
	blurFilterPropTypeUtil,
	cssFilterFunctionPropUtil,
	dropShadowFilterPropTypeUtil,
	filterPropTypeUtil,
	sizePropTypeUtil,
	stringPropTypeUtil,
} from '@elementor/editor-props';
import { screen, waitFor } from '@testing-library/react';

import { colorVariablePropTypeUtil, customSizeVariablePropTypeUtil, sizeVariablePropTypeUtil } from '../../prop-types';
import { registerRepeaterInjections } from '../../repeater-injections';
import { service } from '../../service';

jest.mock( '../../components/ui/color-indicator', () => ( {
	ColorIndicator: ( { value }: { value?: string } ) => (
		<span role="presentation" aria-label="Color indicator">
			{ value ?? '' }
		</span>
	),
} ) );

const COLOR_VARIABLE_ID = 'e-gv-main';
const DROP_SHADOW_RESOLVED_X = '15px';
const DROP_SHADOW_SIZE_VARIABLE_ID = 'e-gs-filter-x';
const BLUR_SIZE_VARIABLE_ID = 'e-gs-filter-blur';
const RESOLVED_BLUR_SIZE = '8px';
const RESOLVED_COLOR_HEX = '#abcdef';

const cssFilterFunc = createMockSingleSizeFilterPropType();

const propType = createMockPropType( {
	kind: 'array',
	key: 'filter',
	default: null,
	meta: {},
	settings: {},
	item_prop_type: {
		...cssFilterFunc[ 'css-filter-func' ],
	},
} );

describe( 'FiltersRepeaterControl with editor-variables', () => {
	let variablesSpy: jest.SpiedFunction< typeof service.variables >;

	beforeEach( () => {
		registerRepeaterInjections();
		variablesSpy = jest.spyOn( service, 'variables' ).mockReturnValue( {} );
	} );

	afterEach( () => {
		variablesSpy.mockRestore();
	} );

	const renderFiltersRepeater = ( value: ReturnType< typeof filterPropTypeUtil.create > ) => {
		renderControl( <FilterRepeaterControl />, {
			setValue: jest.fn(),
			propType,
			value,
		} );
	};

	const expectRepeaterIconShowsResolvedColorVariable = () => {
		expect( screen.getByText( RESOLVED_COLOR_HEX ) ).toBeInTheDocument();
		expect( screen.getByRole( 'presentation', { name: 'Color indicator' } ) ).toHaveTextContent(
			RESOLVED_COLOR_HEX
		);
	};

	it( 'should render filters repeater with global color variable', async () => {
		// Arrange.
		variablesSpy.mockReturnValue( {
			[ COLOR_VARIABLE_ID ]: {
				type: colorVariablePropTypeUtil.key,
				label: 'Main',
				value: RESOLVED_COLOR_HEX,
			},
		} );

		// Act.
		renderFiltersRepeater(
			filterPropTypeUtil.create( [
				cssFilterFunctionPropUtil.create( {
					func: stringPropTypeUtil.create( 'drop-shadow' ),
					args: dropShadowFilterPropTypeUtil.create( {
						xAxis: sizePropTypeUtil.create( { size: 2, unit: 'px' } ),
						yAxis: sizePropTypeUtil.create( { size: 4, unit: 'px' } ),
						blur: sizePropTypeUtil.create( { size: 6, unit: 'px' } ),
						color: colorVariablePropTypeUtil.create( COLOR_VARIABLE_ID ),
					} ),
				} ),
			] )
		);

		// Assert.
		await waitFor( () => {
			expect( screen.getByText( 'Drop shadow:' ) ).toBeInTheDocument();
			expect( screen.getByText( '2px 4px 6px' ) ).toBeInTheDocument();
		} );

		expectRepeaterIconShowsResolvedColorVariable();
	} );

	it( 'should render drop-shadow repeater label with resolved global size variable on an axis', async () => {
		// Arrange.
		variablesSpy.mockReturnValue( {
			[ COLOR_VARIABLE_ID ]: {
				type: colorVariablePropTypeUtil.key,
				label: 'Main',
				value: RESOLVED_COLOR_HEX,
			},
			[ DROP_SHADOW_SIZE_VARIABLE_ID ]: {
				type: sizeVariablePropTypeUtil.key,
				label: 'named-x',
				value: DROP_SHADOW_RESOLVED_X,
			},
		} );

		// Act.
		renderFiltersRepeater(
			filterPropTypeUtil.create( [
				cssFilterFunctionPropUtil.create( {
					func: stringPropTypeUtil.create( 'drop-shadow' ),
					args: dropShadowFilterPropTypeUtil.create( {
						xAxis: sizeVariablePropTypeUtil.create( DROP_SHADOW_SIZE_VARIABLE_ID ),
						yAxis: sizePropTypeUtil.create( { size: 4, unit: 'px' } ),
						blur: sizePropTypeUtil.create( { size: 6, unit: 'px' } ),
						color: colorVariablePropTypeUtil.create( COLOR_VARIABLE_ID ),
					} ),
				} ),
			] )
		);

		// Assert.
		await waitFor( () => {
			expect( screen.getByText( /Drop shadow:\s*15px 4px 6px/ ) ).toBeInTheDocument();
		} );
		expect( screen.queryByText( /Drop shadow:\s*0px 4px 6px/ ) ).not.toBeInTheDocument();

		expectRepeaterIconShowsResolvedColorVariable();
	} );

	it( 'should render drop-shadow repeater label with resolved global custom size variable on an axis', async () => {
		// Arrange.
		const CUSTOM_SIZE_VARIABLE_ID = 'e-gcs-filter-y';
		const RESOLVED_Y = '1.5rem';

		variablesSpy.mockReturnValue( {
			[ COLOR_VARIABLE_ID ]: {
				type: colorVariablePropTypeUtil.key,
				label: 'Main',
				value: RESOLVED_COLOR_HEX,
			},
			[ CUSTOM_SIZE_VARIABLE_ID ]: {
				type: customSizeVariablePropTypeUtil.key,
				label: 'custom-y',
				value: RESOLVED_Y,
			},
		} );

		// Act.
		renderFiltersRepeater(
			filterPropTypeUtil.create( [
				cssFilterFunctionPropUtil.create( {
					func: stringPropTypeUtil.create( 'drop-shadow' ),
					args: dropShadowFilterPropTypeUtil.create( {
						xAxis: sizePropTypeUtil.create( { size: 2, unit: 'px' } ),
						yAxis: customSizeVariablePropTypeUtil.create( CUSTOM_SIZE_VARIABLE_ID ),
						blur: sizePropTypeUtil.create( { size: 6, unit: 'px' } ),
						color: colorVariablePropTypeUtil.create( COLOR_VARIABLE_ID ),
					} ),
				} ),
			] )
		);

		// Assert.
		await waitFor( () => {
			expect( screen.getByText( /Drop shadow:\s*2px 1\.5rem 6px/ ) ).toBeInTheDocument();
		} );

		expectRepeaterIconShowsResolvedColorVariable();
	} );

	it( 'should render blur filter repeater label with resolved global size variable', async () => {
		// Arrange.
		variablesSpy.mockReturnValue( {
			[ BLUR_SIZE_VARIABLE_ID ]: {
				type: sizeVariablePropTypeUtil.key,
				label: 'named-blur',
				value: RESOLVED_BLUR_SIZE,
			},
		} );

		// Act.
		renderFiltersRepeater(
			filterPropTypeUtil.create( [
				cssFilterFunctionPropUtil.create( {
					func: stringPropTypeUtil.create( 'blur' ),
					args: blurFilterPropTypeUtil.create( {
						size: sizeVariablePropTypeUtil.create( BLUR_SIZE_VARIABLE_ID ),
					} ),
				} ),
			] )
		);

		// Assert.
		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: /blur:\s*8px/ } ) ).toBeInTheDocument();
		} );
		expect( screen.queryByRole( 'button', { name: /blur:\s*0px/ } ) ).not.toBeInTheDocument();
	} );
} );
