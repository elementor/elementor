import * as React from 'react';
import { type ComponentType } from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { trackUpgradePromotionClick, trackViewPromotion } from '../../../utils/tracking';
import { AttributesControl } from '../attributes-control';
import { DisplayConditionsControl } from '../display-conditions-control';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

jest.mock( '../../../utils/tracking', () => ( {
	trackViewPromotion: jest.fn(),
	trackUpgradePromotionClick: jest.fn(),
} ) );

const mockPromotion = {
	title: 'Upgrade to Pro',
	content: 'Unlock promotion feature',
	image: 'https://example.com/promo-image.png',
	ctaUrl: 'https://example.com/upgrade',
};

const propType = createMockPropType( { kind: 'array' } );

type PromotionControlTestCase = {
	name: string;
	Component: ComponentType;
	bind: string;
	triggerLabel: string;
	promotionConfigKey: string;
	isIconButton: boolean;
	expectedTrackingData: { target_name: string; location_l2: string };
};

const promotionControls: PromotionControlTestCase[] = [
	{
		name: 'AttributesControl',
		Component: AttributesControl,
		bind: 'attributes',
		triggerLabel: 'Attributes',
		promotionConfigKey: 'attributes',
		isIconButton: false,
		expectedTrackingData: { target_name: 'attributes', location_l2: 'general' },
	},
	{
		name: 'DisplayConditionsControl',
		Component: DisplayConditionsControl,
		bind: 'display-conditions',
		triggerLabel: 'Display Conditions',
		promotionConfigKey: 'displayConditions',
		isIconButton: true,
		expectedTrackingData: { target_name: 'display_conditions', location_l2: 'general' },
	},
];

const setupWindowElementor = ( promotionConfigKey: string ) => {
	global.window.elementor = {
		config: {
			v4Promotions: {
				[ promotionConfigKey ]: mockPromotion,
			},
		},
	} as typeof window.elementor;
};

const cleanupWindowElementor = () => {
	delete global.window.elementor;
};

describe.each( promotionControls )(
	'$name',
	( { Component, bind, triggerLabel, promotionConfigKey, isIconButton, expectedTrackingData } ) => {
		const defaultProps = {
			bind,
			propType,
			value: { $$type: 'array', value: [] },
		};

		const getTriggerElement = () => {
			if ( isIconButton ) {
				return screen.getByRole( 'button', { name: triggerLabel } );
			}
			return screen.getByLabelText( triggerLabel );
		};

		beforeEach( () => {
			setupWindowElementor( promotionConfigKey );
		} );

		afterEach( () => {
			cleanupWindowElementor();
			jest.clearAllMocks();
		} );

		it( 'should render promotion chip and trigger element', () => {
			// Arrange & Act.
			renderControl( <Component />, defaultProps );

			// Assert.
			expect( screen.getByLabelText( 'Promotion chip' ) ).toBeInTheDocument();
			expect( getTriggerElement() ).toBeInTheDocument();
		} );

		it( 'should open infotip when clicking promotion chip', () => {
			// Arrange.
			renderControl( <Component />, defaultProps );
			const chip = screen.getByLabelText( 'Promotion chip' );

			// Act.
			fireEvent.click( chip );

			// Assert.
			expect( screen.getByText( mockPromotion.title ) ).toBeInTheDocument();
			expect( screen.getByText( mockPromotion.content ) ).toBeInTheDocument();
		} );

		it( 'should open infotip when clicking trigger element', () => {
			// Arrange.
			renderControl( <Component />, defaultProps );
			const trigger = getTriggerElement();

			// Act.
			fireEvent.click( trigger );

			// Assert.
			expect( screen.getByText( mockPromotion.title ) ).toBeInTheDocument();
		} );

		it( 'should call trackViewPromotion when promotion is opened', () => {
			// Arrange.
			renderControl( <Component />, defaultProps );
			const chip = screen.getByLabelText( 'Promotion chip' );

			// Act.
			fireEvent.click( chip );

			// Assert.
			expect( trackViewPromotion ).toHaveBeenCalledWith( expectedTrackingData );
		} );

		it( 'should not call trackViewPromotion when promotion is closed', () => {
			// Arrange.
			renderControl( <Component />, defaultProps );
			const chip = screen.getByLabelText( 'Promotion chip' );

			// Act - open then close.
			fireEvent.click( chip );
			jest.mocked( trackViewPromotion ).mockClear();
			fireEvent.click( chip );

			// Assert.
			expect( trackViewPromotion ).not.toHaveBeenCalled();
		} );

		it( 'should call trackUpgradePromotionClick when CTA is clicked', () => {
			// Arrange.
			renderControl( <Component />, defaultProps );
			const chip = screen.getByLabelText( 'Promotion chip' );
			fireEvent.click( chip );

			// Act.
			const ctaButton = screen.getByRole( 'link', { name: /Upgrade Now/i } );
			fireEvent.click( ctaButton );

			// Assert.
			expect( trackUpgradePromotionClick ).toHaveBeenCalledWith( expectedTrackingData );
		} );
	}
);
