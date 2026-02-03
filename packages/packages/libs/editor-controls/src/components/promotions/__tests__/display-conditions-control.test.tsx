import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { DisplayConditionsControl } from '../display-conditions-control';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

const mockPromotion = {
	title: 'Upgrade to Pro',
	content: 'Unlock display conditions feature',
	image: 'https://example.com/promo-image.png',
	ctaUrl: 'https://example.com/upgrade',
};

const propType = createMockPropType( { kind: 'array' } );

const defaultProps = {
	bind: 'display-conditions',
	propType,
	value: { $$type: 'array', value: [] },
};

const setupWindowElementor = ( promotion = mockPromotion ) => {
	global.window.elementor = {
		config: {
			v4Promotions: {
				displayConditions: promotion,
			},
		},
	} as typeof window.elementor;
};

const cleanupWindowElementor = () => {
	delete global.window.elementor;
};

describe( 'DisplayConditionsControl', () => {
	beforeEach( () => {
		setupWindowElementor();
	} );

	afterEach( () => {
		cleanupWindowElementor();
	} );

	it( 'should render promotion chip and icon button', () => {
		// Arrange & Act.
		renderControl( <DisplayConditionsControl />, defaultProps );

		// Assert.
		expect( screen.getByLabelText( 'Promotion chip' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Display Conditions' } ) ).toBeInTheDocument();
	} );

	it( 'should open infotip when clicking promotion chip', () => {
		// Arrange.
		renderControl( <DisplayConditionsControl />, defaultProps );
		const chip = screen.getByLabelText( 'Promotion chip' );

		// Act.
		fireEvent.click( chip );

		// Assert.
		expect( screen.getByText( mockPromotion.title ) ).toBeInTheDocument();
		expect( screen.getByText( mockPromotion.content ) ).toBeInTheDocument();
	} );

	it( 'should open infotip when clicking icon button', () => {
		// Arrange.
		renderControl( <DisplayConditionsControl />, defaultProps );
		const button = screen.getByRole( 'button', { name: 'Display Conditions' } );

		// Act.
		fireEvent.click( button );

		// Assert.
		expect( screen.getByText( mockPromotion.title ) ).toBeInTheDocument();
	} );
} );
