import * as React from 'react';
import { useRef } from 'react';
import { type ToggleButtonGroupItem, ToggleButtonGroupUi } from '@elementor/editor-controls';
import { Number123Icon, RepeatIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { InteractionsPromotionChip, type InteractionsPromotionChipRef } from '../../ui/interactions-promotion-chip';
import { PromotionOverlayLayout } from '../../ui/promotion-overlay-layout';

const TRACKING_DATA = { target_name: 'interactions_repeat', location_l2: 'interactions' } as const;

export const REPEAT_OPTIONS = {
	times: __( 'times', 'elementor' ),
	loop: __( 'loop', 'elementor' ),
};

export const REPEAT_TOOLTIPS = {
	times: __( 'Enable number', 'elementor' ),
	loop: __( 'Infinite repeat', 'elementor' ),
};

const REPEAT_TARGET_VALUES = {
	[ REPEAT_OPTIONS.times ]: 'times',
	[ REPEAT_OPTIONS.loop ]: 'loop',
} as const;

export function Repeat() {
	const repeatContainerRef = useRef< HTMLDivElement >( null );
	const promotionRef = useRef< InteractionsPromotionChipRef >( null );

	const options: ToggleButtonGroupItem< string >[] = [
		{
			value: REPEAT_OPTIONS.times,
			promotionLocked: true,
			label: REPEAT_TOOLTIPS.times,
			renderContent: ( { size } ) => <Number123Icon fontSize={ size } />,
			showTooltip: true,
		},
		{
			value: REPEAT_OPTIONS.loop,
			promotionLocked: true,
			label: REPEAT_TOOLTIPS.loop,
			renderContent: ( { size } ) => <RepeatIcon fontSize={ size } />,
			showTooltip: true,
		},
	];

	const handleChange = ( newValue: string ) => {
		const targetValue = REPEAT_TARGET_VALUES[ newValue as keyof typeof REPEAT_TARGET_VALUES ];

		if ( targetValue ) {
			promotionRef.current?.openPromotion( { target_value: targetValue } );
		}
	};

	return (
		<PromotionOverlayLayout
			ref={ repeatContainerRef }
			promotionChip={
				<InteractionsPromotionChip
					ref={ promotionRef }
					content={ __( 'Upgrade to control how many times the animation repeats.', 'elementor' ) }
					upgradeUrl={ 'https://go.elementor.com/go-pro-interactions-repeat-modal/' }
					anchorRef={ repeatContainerRef }
					trackingData={ TRACKING_DATA }
				/>
			}
		>
			<ToggleButtonGroupUi items={ options } exclusive onChange={ handleChange } value={ '' } />
		</PromotionOverlayLayout>
	);
}
