import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { type BoxShadowPropValue } from '@elementor/editor-props';
import { screen } from '@testing-library/react';

import { BoxShadowRepeaterControl } from '../box-shadow-repeater-control';

describe( 'BoxShadowRepeaterControl', () => {
	it( 'should render the box shadow repeater with its label', () => {
		const propType = createMockPropType( {
			kind: 'array',
			item_prop_type: createMockPropType( { kind: 'object' } ),
		} );

		// Act.
		renderControl( <BoxShadowRepeaterControl />, { value: mockBoxShadow, propType } );

		// Assert.
		expect( screen.getByText( 'Box shadow' ) ).toBeInTheDocument();
		expect( screen.getByText( 'inset: 1px 2px 3px 4px' ) ).toBeInTheDocument();
	} );

	it( "should render the box shadow repeater with the position as 'outset' if it's null", () => {
		const propType = createMockPropType( {
			kind: 'array',
			item_prop_type: createMockPropType( { kind: 'object' } ),
		} );

		// Act.
		renderControl( <BoxShadowRepeaterControl />, { value: mockBoxShadowInitial, propType } );

		// Assert.
		expect( screen.getByText( 'Box shadow' ) ).toBeInTheDocument();
		expect( screen.getByText( 'outset: 0px 0px 10px 0px' ) ).toBeInTheDocument();
	} );
} );

const mockBoxShadow: BoxShadowPropValue = {
	$$type: 'box-shadow',
	value: [
		{
			$$type: 'shadow',
			value: {
				position: {
					$$type: 'string',
					value: 'inset',
				},
				hOffset: {
					$$type: 'size',
					value: { unit: 'px', size: 1 },
				},
				vOffset: {
					$$type: 'size',
					value: { unit: 'px', size: 2 },
				},
				blur: {
					$$type: 'size',
					value: { unit: 'px', size: 3 },
				},
				spread: {
					$$type: 'size',
					value: { unit: 'px', size: 4 },
				},
				color: {
					$$type: 'color',
					value: '#000000',
				},
			},
		},
	],
};

const mockBoxShadowInitial: BoxShadowPropValue = {
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
					$$type: 'color',
					value: 'rgba(0, 0, 0, 1)',
				},
			},
		},
	],
};
