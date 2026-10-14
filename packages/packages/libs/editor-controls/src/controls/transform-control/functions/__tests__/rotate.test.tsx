import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { screen } from '@testing-library/react';

import { Rotate } from '../rotate';

describe( 'Rotate Transform', () => {
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
			z: createAxisProp(),
		},
	} );

	it.each( [
		[
			'full value',
			{
				x: { $$type: 'size', value: { size: 30, unit: 'deg' } },
				y: { $$type: 'size', value: { size: 15, unit: 'deg' } },
				z: { $$type: 'size', value: { size: 90, unit: 'deg' } },
			},
		],
		[
			'all nulls',
			{
				x: null,
				y: null,
				z: null,
			},
		],
		[
			'partial nulls',
			{
				x: { $$type: 'size', value: { size: 10, unit: 'deg' } },
				y: null,
				z: { $$type: 'size', value: { size: 0, unit: 'deg' } },
			},
		],
	] )( 'should render labels with mock case: %s', ( _label, mockValue ) => {
		renderControl( <Rotate />, { value: mockValue, propType } );

		expect( screen.getByText( 'Rotate X' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Rotate Y' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Rotate Z' ) ).toBeInTheDocument();
	} );
} );
