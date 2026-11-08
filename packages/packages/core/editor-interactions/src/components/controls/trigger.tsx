import * as React from 'react';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';
import { PromotionSelect } from '../../ui/promotion-select';
import { DEFAULT_VALUES } from '../interaction-details';

const TRACKING_DATA = { target_name: 'interactions_trigger', location_l2: 'interactions' } as const;

export const TRIGGER_OPTIONS = {
	load: __( 'Page load', 'elementor' ),
	scrollIn: __( 'Scroll into view', 'elementor' ),
	scrollOn: __( 'While scrolling', 'elementor' ),
	hover: __( 'On hover', 'elementor' ),
	click: __( 'On click', 'elementor' ),
};

export const CODE_EFFECT_TRIGGER_OPTIONS = {
	load: TRIGGER_OPTIONS.load,
	scrollIn: TRIGGER_OPTIONS.scrollIn,
	scrollOut: __( 'Scroll out of view', 'elementor' ),
	scrollOn: TRIGGER_OPTIONS.scrollOn,
	hover: TRIGGER_OPTIONS.hover,
	click: TRIGGER_OPTIONS.click,
	doubleClick: __( 'On double click', 'elementor' ),
	longPress: __( 'On long press', 'elementor' ),
	drag: __( 'On drag', 'elementor' ),
	resize: __( 'On resize', 'elementor' ),
};

export const BASE_TRIGGERS: string[] = [ 'load', 'scrollIn' ];

export function Trigger( { value, onChange }: FieldProps ) {
	const baseOptions = Object.fromEntries(
		Object.entries( TRIGGER_OPTIONS ).filter( ( [ key ] ) => BASE_TRIGGERS.includes( key ) )
	);

	const disabledOptions = Object.fromEntries(
		Object.entries( TRIGGER_OPTIONS ).filter( ( [ key ] ) => ! BASE_TRIGGERS.includes( key ) )
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
			trackingData={ TRACKING_DATA }
		/>
	);
}
