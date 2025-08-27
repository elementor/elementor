import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { screen } from '@testing-library/react';

import { Scale } from '../scale';

describe( 'Scale Transform', () => {
	const propType = createMockPropType( {
		kind: 'object',
		shape: {
			x: createMockPropType( {
				kind: 'object',
				shape: {
					unit: createMockPropType( { kind: 'plain' } ),
					size: createMockPropType( { kind: 'plain' } ),
				},
			} ),
			y: createMockPropType( {
				kind: 'object',
				shape: {
					unit: createMockPropType( { kind: 'plain' } ),
					size: createMockPropType( { kind: 'plain' } ),
				},
			} ),
			z: createMockPropType( {
				kind: 'object',
				shape: {
					unit: createMockPropType( { kind: 'plain' } ),
					size: createMockPropType( { kind: 'plain' } ),
				},
			} ),
		},
	} );

	it( 'should render scale controls with proper labels', () => {
		// Arrange.
		const mockValue = {
			x: { $$type: 'number', value: 1 },
			y: { $$type: 'number', value: 1 },
			z: { $$type: 'number', value: 1 },
		};

		// Act.
		renderControl( <Scale />, { value: mockValue, propType } );

		// Assert.
		expect( screen.getByText( 'Scale X' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Scale Y' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Scale Z' ) ).toBeInTheDocument();
	} );
} );
