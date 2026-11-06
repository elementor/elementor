import * as React from 'react';
import { useRef } from 'react';
import { type ToggleButtonGroupItem, ToggleButtonGroupUi } from '@elementor/editor-controls';
import { CheckIcon, MinusIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ReplayFieldProps } from '../../types';
import { InteractionsPromotionChip, type InteractionsPromotionChipRef } from '../../ui/interactions-promotion-chip';
import { PromotionOverlayLayout } from '../../ui/promotion-overlay-layout';

const TRACKING_DATA = { target_name: 'interactions_replay', location_l2: 'interactions' } as const;

export const REPLAY_OPTIONS = {
	no: __( 'No', 'elementor' ),
	yes: __( 'Yes', 'elementor' ),
};

export const BASE_REPLAY: string[] = [ 'no' ];

export function Replay( { onChange }: ReplayFieldProps ) {
	const replayContainerRef = useRef< HTMLDivElement >( null );
	const promotionRef = useRef< InteractionsPromotionChipRef >( null );

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
			promotionLocked: true,
			label: REPLAY_OPTIONS.yes,
			renderContent: ( { size } ) => <CheckIcon fontSize={ size } />,
			showTooltip: true,
		},
	];

	const handleChange = ( newValue: boolean ) => {
		if ( true === newValue ) {
			promotionRef.current?.openPromotion( { target_value: 'yes' } );
			return;
		}

		onChange( newValue );
	};

	return (
		<PromotionOverlayLayout
			ref={ replayContainerRef }
			promotionChip={
				<InteractionsPromotionChip
					ref={ promotionRef }
					content={ __( 'Upgrade to run the animation every time its trigger occurs.', 'elementor' ) }
					upgradeUrl={ 'https://go.elementor.com/go-pro-interactions-replay-modal/' }
					anchorRef={ replayContainerRef }
					trackingData={ TRACKING_DATA }
				/>
			}
		>
			<ToggleButtonGroupUi items={ options } exclusive onChange={ handleChange } value={ false } />
		</PromotionOverlayLayout>
	);
}
