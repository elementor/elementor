import * as React from 'react';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';
import { PromotionSelect } from '../../ui/promotion-select';
import { DEFAULT_VALUES } from '../interaction-details';

export const EASING_OPTIONS = {
	easeIn: __( 'Ease In', 'elementor' ),
	easeInOut: __( 'Ease In Out', 'elementor' ),
	easeOut: __( 'Ease Out', 'elementor' ),
	backIn: __( 'Back In', 'elementor' ),
	backInOut: __( 'Back In Out', 'elementor' ),
	backOut: __( 'Back Out', 'elementor' ),
	linear: __( 'Linear', 'elementor' ),
};

export const BASE_EASINGS: string[] = [ 'easeIn' ];

export function Easing( {}: FieldProps ) {
	const baseOptions = Object.fromEntries(
		Object.entries( EASING_OPTIONS ).filter( ( [ key ] ) => BASE_EASINGS.includes( key ) )
	);

	const disabledOptions = Object.fromEntries(
		Object.entries( EASING_OPTIONS ).filter( ( [ key ] ) => ! BASE_EASINGS.includes( key ) )
	);

	return (
		<PromotionSelect
			value={ DEFAULT_VALUES.easing }
			baseOptions={ baseOptions }
			disabledOptions={ disabledOptions }
			promotionContent={ __( 'Upgrade to control the smoothness of the interaction.', 'elementor' ) }
			upgradeUrl="https://go.elementor.com/go-pro-interactions-easing-modal/"
		/>
	);
}
