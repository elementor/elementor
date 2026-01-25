import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { screen } from '@testing-library/react';

import { DisplayConditionsControl } from '../display-conditions-control';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

const propType = createMockPropType( { kind: 'array' } );

describe( 'DisplayConditionsControl', () => {
	it( 'should render promotion chip and icon when isPromotion is true', () => {
		// Arrange & Act.
		renderControl( <DisplayConditionsControl />, {
			bind: 'display-conditions',
			propType,
			value: { $$type: 'array', value: [] },
		} );

		// Assert.
		expect( screen.getByLabelText( 'Promotion chip' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Display Conditions' } ) ).toBeInTheDocument();
	} );
} );
