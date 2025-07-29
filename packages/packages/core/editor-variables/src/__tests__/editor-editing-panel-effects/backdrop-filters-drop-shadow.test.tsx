import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { screen } from '@testing-library/react';
import {
	cssFilterFunctionPropUtil,
	dropShadowFilterPropTypeUtil,
	backdropFilterPropTypeUtil,
	sizePropTypeUtil,
	stringPropTypeUtil,
} from '@elementor/editor-props';
import { FilterRepeaterControl } from '@elementor/editor-controls';

import { colorVariablePropTypeUtil } from '../../prop-types/color-variable-prop-type';

const propType = createMockPropType( {
	kind: 'array',
	item_prop_type: createMockPropType( { kind: 'object' } ),
} );

describe( 'FiltersRepeaterControl with editor-variables', () => {
	it( 'should render filters repeater with global color variable', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = {
			setValue,
			propType,
			value: backdropFilterPropTypeUtil.create( [
				cssFilterFunctionPropUtil.create( {
					func: stringPropTypeUtil.create( 'drop-shadow' ),
					args: dropShadowFilterPropTypeUtil.create( {
						xAxis: sizePropTypeUtil.create( { size: 4, unit: 'px' } ),
						yAxis: sizePropTypeUtil.create( { size: 4, unit: 'px' } ),
						blur: sizePropTypeUtil.create( { size: 6, unit: 'px' } ),
						color: colorVariablePropTypeUtil.create( 'e-gv-main' ),
					} ),
				} ),
			] ),
		};

		// Act.
		renderControl( <FilterRepeaterControl filterPropName="backdrop-filter" />, props );

		expect( screen.getByText( 'Drop shadow:' ) ).toBeInTheDocument();
		expect( screen.getByText( '4px 4px 6px' ) ).toBeInTheDocument();
	} );
} );
