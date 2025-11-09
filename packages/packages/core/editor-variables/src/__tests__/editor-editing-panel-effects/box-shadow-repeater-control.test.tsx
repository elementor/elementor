import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { BoxShadowRepeaterControl } from '@elementor/editor-controls';
import { type BoxShadowPropValue } from '@elementor/editor-props';
import { screen } from '@testing-library/react';

import { colorVariablePropTypeUtil } from '../../prop-types/color-variable-prop-type';

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
