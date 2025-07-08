import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { screen } from '@testing-library/react';

import { Rotate } from '../rotate';

describe( 'Rotate Transform', () => {
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

	it( 'should render rotate controls with proper labels', () => {
		// Arrange.
		const mockValue = {
			x: { $$type: 'number', value: { size: 0, unit: 'deg' } },
			y: { $$type: 'size', value: { size: 0, unit: 'deg' } },
			z: { $$type: 'size', value: { size: 0, unit: 'deg' } },
		};

		// Act.
		renderControl( <Rotate />, { value: mockValue, propType } );

		// Assert.
		expect( screen.getByText( 'Rotate X' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Rotate Y' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Rotate Z' ) ).toBeInTheDocument();
	} );
} );
