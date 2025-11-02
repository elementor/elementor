import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { screen } from '@testing-library/react';

import { DisplayConditionsControl } from '../display-conditions-control';

const propType = createMockPropType( { kind: 'plain' } );

describe( 'DisplayConditionsControl', () => {
	it( 'should render with a button containing aria-label and svg icon', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: null, bind: 'display-conditions', propType };

		// Act.
		renderControl( <DisplayConditionsControl />, props );

		// Assert.
		const button = screen.getByRole( 'button', { name: 'Display Conditions' } );
		expect( button ).toBeInTheDocument();
		expect( button ).toHaveAttribute( 'aria-label', 'Display Conditions' );
		// eslint-disable-next-line testing-library/no-node-access
		const svg = button.querySelector( 'svg' );
		expect( svg ).toBeInTheDocument();
	} );
} );
