import * as React from 'react';
import { useRef } from 'react';
import { type ToggleButtonGroupItem, ToggleButtonGroupUi } from '@elementor/editor-controls';
import { Number123Icon, RepeatIcon } from '@elementor/icons';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { InteractionsPromotionChip } from '../../ui/interactions-promotion-chip';
import { PROMOTION_CHIP_OFFSET, PROMOTION_OVERLAY_GRID } from '../../utils/promotion-layout-constants';

const TRACKING_DATA = { target_name: 'interactions_repeat', location_l2: 'interactions' } as const;

export const REPEAT_OPTIONS = {
	times: __( 'times', 'elementor' ),
	loop: __( 'loop', 'elementor' ),
};

export const REPEAT_TOOLTIPS = {
	times: __( 'Enable number', 'elementor' ),
	loop: __( 'Infinite repeat', 'elementor' ),
};

export const BASE_REPEAT: string[] = [];

export function Repeat() {
	const repeatContainerRef = useRef< HTMLDivElement >( null );

	const options: ToggleButtonGroupItem< string >[] = [
		{
			value: REPEAT_OPTIONS.times,
			disabled: true,
			label: REPEAT_TOOLTIPS.times,
			renderContent: ( { size } ) => <Number123Icon fontSize={ size } />,
			showTooltip: true,
		},
		{
			value: REPEAT_OPTIONS.loop,
			disabled: true,
			label: REPEAT_TOOLTIPS.loop,
			renderContent: ( { size } ) => <RepeatIcon fontSize={ size } />,
			showTooltip: true,
		},
	];

	return (
		<Box ref={ repeatContainerRef } sx={ { display: 'grid', alignItems: 'center' } }>
			<Box sx={ { gridArea: PROMOTION_OVERLAY_GRID } }>
				<ToggleButtonGroupUi items={ options } exclusive onChange={ () => {} } value={ '' } />
			</Box>
			<Box
				sx={ { gridArea: PROMOTION_OVERLAY_GRID, marginInlineEnd: PROMOTION_CHIP_OFFSET, justifySelf: 'end' } }
			>
				<InteractionsPromotionChip
					content={ __( 'Upgrade to control how many times the animation repeats.', 'elementor' ) }
					upgradeUrl={ 'https://go.elementor.com/go-pro-interactions-repeat-modal/' }
					anchorRef={ repeatContainerRef }
					trackingData={ TRACKING_DATA }
				/>
			</Box>
		</Box>
	);
}
