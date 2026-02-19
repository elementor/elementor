import * as React from 'react';
import { PromotionSelect } from '../../ui/promotion-select';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';
import { DEFAULT_VALUES } from '../interaction-details';

const BASE_OPTIONS = {
	easeIn: __( 'Ease In', 'elementor' ),
};

const DISABLED_OPTIONS = {
	easeInOut: __( 'Ease In Out', 'elementor' ),
	easeOut: __( 'Ease Out', 'elementor' ),
	backIn: __( 'Back In', 'elementor' ),
	backInOut: __( 'Back In Out', 'elementor' ),
	backOut: __( 'Back Out', 'elementor' ),
	linear: __( 'Linear', 'elementor' ),
};

export function Easing( {}: FieldProps ) {
	return (
		<PromotionSelect
			value={ DEFAULT_VALUES.easing }
			baseOptions={ BASE_OPTIONS }
			disabledOptions={ DISABLED_OPTIONS }
			promotionLabel={ __( 'PRO features', 'elementor' ) }
			promotionContent={ __( 'Upgrade to control the smoothness of the interaction.', 'elementor' ) }
			upgradeUrl="https://go.elementor.com/go-pro-interactions-easing-modal/"
		/>
	);
}
