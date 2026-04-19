import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { BoxShadowRepeaterControl } from '@elementor/editor-controls';
import { type BoxShadowPropValue } from '@elementor/editor-props';
import { screen, waitFor } from '@testing-library/react';

import { colorVariablePropTypeUtil, customSizeVariablePropTypeUtil, sizeVariablePropTypeUtil } from '../../prop-types';
import { registerRepeaterInjections } from '../../repeater-injections';
import { service } from '../../service';

describe( 'BoxShadowRepeaterControl with editor-variables', () => {
	const TEST_COLOR_VARIABLE_ID = 'e-gc-1';

	const mockBoxShadowWithGlobalColor: BoxShadowPropValue = {
		$$type: 'box-shadow',
		value: [
			{
				$$type: 'shadow',
				value: {
					position: null,
					hOffset: {
						$$type: 'size',
						value: { unit: 'px', size: 0 },
					},
					vOffset: {
						$$type: 'size',
						value: { unit: 'px', size: 0 },
					},
					blur: {
						$$type: 'size',
						value: { unit: 'px', size: 10 },
					},
					spread: {
						$$type: 'size',
						value: { unit: 'px', size: 0 },
					},
					color: {
						$$type: colorVariablePropTypeUtil.key,
						value: TEST_COLOR_VARIABLE_ID,
					},
				},
			},
		],
	};

	it( 'should render box shadow repeater with global color variable', () => {
		// Arrange.
		const propType = createMockPropType( {
			kind: 'array',
			item_prop_type: createMockPropType( { kind: 'object' } ),
		} );

		const props = {
			value: mockBoxShadowWithGlobalColor,
			propType,
		};

		// Act.
		renderControl( <BoxShadowRepeaterControl />, props );

		// Assert.
		expect( screen.getByText( 'Box shadow' ) ).toBeInTheDocument();
		expect( screen.getByText( 'outset: 0px 0px 10px 0px' ) ).toBeInTheDocument();
	} );
} );

describe( 'BoxShadowRepeaterControl with repeater label injections registered', () => {
	let variablesSpy: jest.SpiedFunction< typeof service.variables >;

	const propType = createMockPropType( {
		kind: 'array',
		item_prop_type: createMockPropType( { kind: 'object' } ),
	} );

	const plainPx = ( size: number ) => ( {
		$$type: 'size' as const,
		value: { unit: 'px' as const, size },
	} );

	beforeEach( () => {
		registerRepeaterInjections();
		variablesSpy = jest.spyOn( service, 'variables' ).mockReturnValue( {} );
	} );

	afterEach( () => {
		variablesSpy.mockRestore();
	} );

	it( 'should render repeater row label using a resolved global size variable on blur', async () => {
		// Arrange.
		const BLUR_VARIABLE_ID = 'e-box-blur-integration';
		const RESOLVED_BLUR = '14px';
		variablesSpy.mockReturnValue( {
			[ BLUR_VARIABLE_ID ]: {
				type: sizeVariablePropTypeUtil.key,
				label: 'blur-token',
				value: RESOLVED_BLUR,
			},
		} );
		const value: BoxShadowPropValue = {
			$$type: 'box-shadow',
			value: [
				{
					$$type: 'shadow',
					value: {
						position: null,
						hOffset: plainPx( 0 ),
						vOffset: plainPx( 0 ),
						blur: { $$type: sizeVariablePropTypeUtil.key, value: BLUR_VARIABLE_ID },
						spread: plainPx( 0 ),
						color: { $$type: 'color', value: 'rgba(0, 0, 0, 1)' },
					},
				},
			],
		};

		// Act.
		renderControl( <BoxShadowRepeaterControl />, { value, propType } );

		// Assert.
		await waitFor( () => {
			expect( screen.getByText( `outset: 0px 0px ${ RESOLVED_BLUR } 0px` ) ).toBeInTheDocument();
		} );
	} );

	it( 'should render repeater row label using a resolved global custom size variable on spread', async () => {
		// Arrange.
		const SPREAD_VARIABLE_ID = 'e-box-spread-integration';
		const RESOLVED_SPREAD = '2px';
		variablesSpy.mockReturnValue( {
			[ SPREAD_VARIABLE_ID ]: {
				type: customSizeVariablePropTypeUtil.key,
				label: 'spread-token',
				value: RESOLVED_SPREAD,
			},
		} );
		const value: BoxShadowPropValue = {
			$$type: 'box-shadow',
			value: [
				{
					$$type: 'shadow',
					value: {
						position: null,
						hOffset: plainPx( 0 ),
						vOffset: plainPx( 0 ),
						blur: plainPx( 0 ),
						spread: { $$type: customSizeVariablePropTypeUtil.key, value: SPREAD_VARIABLE_ID },
						color: { $$type: 'color', value: 'rgba(0, 0, 0, 1)' },
					},
				},
			],
		};

		// Act.
		renderControl( <BoxShadowRepeaterControl />, { value, propType } );

		// Assert.
		await waitFor( () => {
			expect( screen.getByText( `outset: 0px 0px 0px ${ RESOLVED_SPREAD }` ) ).toBeInTheDocument();
		} );
	} );
} );
