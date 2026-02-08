import * as React from 'react';
import { type ComponentType } from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { AttributesControl } from '../attributes-control';
import { DisplayConditionsControl } from '../display-conditions-control';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
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
};

const promotionControls: PromotionControlTestCase[] = [
	{
		name: 'AttributesControl',
		Component: AttributesControl,
		bind: 'attributes',
		triggerLabel: 'Attributes',
		promotionConfigKey: 'attributes',
		isIconButton: false,
	},
	{
		name: 'DisplayConditionsControl',
		Component: DisplayConditionsControl,
		bind: 'display-conditions',
		triggerLabel: 'Display Conditions',
		promotionConfigKey: 'displayConditions',
		isIconButton: true,
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
	( { Component, bind, triggerLabel, promotionConfigKey, isIconButton } ) => {
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
	}
);
