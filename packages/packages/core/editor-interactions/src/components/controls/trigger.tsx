import * as React from 'react';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';
import { PromotionSelect } from '../../ui/promotion-select';
import { DEFAULT_VALUES } from '../interaction-details';


const BASE_OPTIONS = {
	load: __( 'Page load', 'elementor' ),
	scrollIn: __( 'Scroll into view', 'elementor' ),
};

const EXTENDED_OPTIONS = {
	scrollOn: __( 'While Scrolling', 'elementor' ),
	hover: __( 'On hover', 'elementor' ),
	click: __( 'On click', 'elementor' ),
};

export function Trigger( { value, onChange }: FieldProps ) {
	return (
		<PromotionSelect
			value={ value in BASE_OPTIONS ? value : DEFAULT_VALUES.trigger }
			onChange={ onChange }
			baseOptions={ BASE_OPTIONS }
			extendedOptions={ EXTENDED_OPTIONS }
			proLabel={ __( 'PRO triggers', 'elementor' ) }
			proContent={ __( 'Upgrade to unlock more interactions triggers.', 'elementor' ) }
			upgradeUrl="https://go.elementor.com/go-pro-interactions-triggers-modal/"
		/>
	);
}
