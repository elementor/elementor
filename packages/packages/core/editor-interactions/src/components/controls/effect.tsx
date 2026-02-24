import * as React from 'react';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';
import { PromotionSelect } from '../../ui/promotion-select';
import { DEFAULT_VALUES } from '../interaction-details';

export const EFFECT_OPTIONS = {
	fade: __( 'Fade', 'elementor' ),
	slide: __( 'Slide', 'elementor' ),
	scale: __( 'Scale', 'elementor' ),
	custom: __( 'Custom', 'elementor' ),
};

export const BASE_EFFECTS: string[] = [ 'fade', 'slide', 'scale' ];

export function Effect( { value, onChange }: FieldProps ) {
	const baseOptions = Object.fromEntries(
		Object.entries( EFFECT_OPTIONS ).filter( ( [ key ] ) => BASE_EFFECTS.includes( key ) )
	);

	const disabledOptions = Object.fromEntries(
		Object.entries( EFFECT_OPTIONS ).filter( ( [ key ] ) => ! BASE_EFFECTS.includes( key ) )
	);

	return (
		<PromotionSelect
			value={ value in baseOptions ? value : DEFAULT_VALUES.effect }
			onChange={ onChange }
			baseOptions={ baseOptions }
			disabledOptions={ disabledOptions }
			promotionLabel={ __( 'PRO effects', 'elementor' ) }
			promotionContent={ __(
				'Upgrade to further customize your animation with opacity, scale, move, rotate and more.',
				'elementor'
			) }
			upgradeUrl="https://go.elementor.com/go-pro-interactions-custom-effect-modal/"
		/>
	);
}
