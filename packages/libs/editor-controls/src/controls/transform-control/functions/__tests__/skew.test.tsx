import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { screen } from '@testing-library/react';

import { Skew } from '../skew';

describe( 'Skew Transform', () => {
	const createAxisProp = () =>
		createMockPropType( {
			kind: 'object',
			shape: {
				unit: createMockPropType( { kind: 'plain' } ),
				size: createMockPropType( { kind: 'plain' } ),
			},
		} );

	const propType = createMockPropType( {
		kind: 'object',
		shape: {
			x: createAxisProp(),
			y: createAxisProp(),
		},
	} );

	it.each( [
		[
			'full value',
			{
				x: { $$type: 'size', value: { size: 30, unit: 'deg' } },
				y: { $$type: 'size', value: { size: 15, unit: 'deg' } },
			},
		],
		[
			'all nulls',
			{
				x: null,
				y: null,
			},
		],
		[
			'partial nulls',
			{
				x: { $$type: 'size', value: { size: 10, unit: 'deg' } },
				y: null,
			},
		],
	] )( 'should render labels with mock case: %s', ( _label, mockValue ) => {
		renderControl( <Skew />, { value: mockValue, propType } );

		expect( screen.getByText( 'Skew X' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Skew Y' ) ).toBeInTheDocument();
	} );
} );
