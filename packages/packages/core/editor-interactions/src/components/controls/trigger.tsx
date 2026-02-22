import * as React from 'react';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';
import { PromotionSelect } from '../../ui/promotion-select';
import { DEFAULT_VALUES } from '../interaction-details';

export const TRIGGER_OPTIONS = {
	load: __( 'Page load', 'elementor' ),
	scrollIn: __( 'Scroll into view', 'elementor' ),
	scrollOn: __( 'While scrolling', 'elementor' ),
	hover: __( 'On hover', 'elementor' ),
	click: __( 'On click', 'elementor' ),
};

export const BASE_TRIGGERS: string[] = [ 'load', 'scrollIn' ];

export function Trigger( { value, onChange }: FieldProps ) {
	const baseOptions = Object.fromEntries(
		Object.entries( TRIGGER_OPTIONS ).filter( ( [ key ] ) => BASE_TRIGGERS.includes( key ) ),
	);

	const disabledOptions = Object.fromEntries(
		Object.entries( TRIGGER_OPTIONS ).filter( ( [ key ] ) => ! BASE_TRIGGERS.includes( key ) ),
	);

	return (
		<PromotionSelect
			value={ value in baseOptions ? value : DEFAULT_VALUES.trigger }
			onChange={ onChange }
			baseOptions={ baseOptions }
			disabledOptions={ disabledOptions }
			promotionLabel={ __( 'PRO triggers', 'elementor' ) }
			promotionContent={ __( 'Upgrade to unlock more interactions triggers.', 'elementor' ) }
			upgradeUrl="https://go.elementor.com/go-pro-interactions-triggers-modal/"
		/>
	);
}
