import * as React from 'react';
import { useRef } from 'react';
import { type ToggleButtonGroupItem, ToggleButtonGroupUi } from '@elementor/editor-controls';
import { CheckIcon, MinusIcon } from '@elementor/icons';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ReplayFieldProps } from '../../types';
import { InteractionsPromotionChip } from '../../ui/interactions-promotion-chip';
import { PROMOTION_CHIP_OFFSET, PROMOTION_OVERLAY_GRID } from '../../utils/promotion-layout-constants';

const TRACKING_DATA = { target_name: 'interactions_replay', location_l2: 'interactions' } as const;

export const REPLAY_OPTIONS = {
	no: __( 'No', 'elementor' ),
	yes: __( 'Yes', 'elementor' ),
};

export const BASE_REPLAY: string[] = [ 'no' ];

export function Replay( { onChange }: ReplayFieldProps ) {
	const replayContainerRef = useRef< HTMLDivElement >( null );
	const options: ToggleButtonGroupItem< boolean >[] = [
		{
			value: false,
			disabled: false,
			label: REPLAY_OPTIONS.no,
			renderContent: ( { size } ) => <MinusIcon fontSize={ size } />,
			showTooltip: true,
		},
		{
			value: true,
			disabled: true,
			label: REPLAY_OPTIONS.yes,
			renderContent: ( { size } ) => <CheckIcon fontSize={ size } />,
			showTooltip: true,
		},
	];

	return (
		<Box ref={ replayContainerRef } sx={ { display: 'grid', alignItems: 'center' } }>
			<Box sx={ { gridArea: PROMOTION_OVERLAY_GRID } }>
				<ToggleButtonGroupUi items={ options } exclusive onChange={ onChange } value={ false } />
			</Box>
			<Box sx={ { gridArea: PROMOTION_OVERLAY_GRID, marginInlineEnd: PROMOTION_CHIP_OFFSET, justifySelf: 'end' } }>
				<InteractionsPromotionChip
					content={ __( 'Upgrade to run the animation every time its trigger occurs.', 'elementor' ) }
					upgradeUrl={ 'https://go.elementor.com/go-pro-interactions-replay-modal/' }
					anchorRef={ replayContainerRef }
					trackingData={ TRACKING_DATA }
				/>
			</Box>
		</Box>
	);
}
