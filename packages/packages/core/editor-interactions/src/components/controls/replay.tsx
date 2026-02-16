import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleButtonGroupUi } from '@elementor/editor-controls';
import { CheckIcon, MinusIcon } from '@elementor/icons';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ReplayFieldProps } from '../../types';
import { InteractionsPromotionChip } from '../../ui/interactions-promotion-chip';

const OVERLAY_GRID = '1 / 1';
const CHIP_OFFSET = '50%';

export function Replay( { onChange, anchorRef }: ReplayFieldProps ) {
	const options: ToggleButtonGroupItem< boolean >[] = [
		{
			value: false,
			disabled: false,
			label: __( 'No', 'elementor' ),
			renderContent: ( { size } ) => <MinusIcon fontSize={ size } />,
			showTooltip: true,
		},
		{
			value: true,
			disabled: true,
			label: __( 'Yes', 'elementor' ),
			renderContent: ( { size } ) => <CheckIcon fontSize={ size } />,
			showTooltip: true,
		},
	];

	return (
		<Box sx={ { display: 'grid', alignItems: 'center' } }>
			<Box sx={ { gridArea: OVERLAY_GRID } }>
				<ToggleButtonGroupUi items={ options } exclusive onChange={ onChange } value={ false } />
			</Box>
			<Box sx={ { gridArea: OVERLAY_GRID, marginInlineEnd: CHIP_OFFSET, justifySelf: 'end' } }>
				<InteractionsPromotionChip
					content={ __( 'Upgrade to run the animation every time its trigger occurs.', 'elementor' ) }
					upgradeUrl={ 'https://go.elementor.com/go-pro-interactions-replay-modal/' }
					anchorRef={ anchorRef }
				/>
			</Box>
		</Box>
	);
}
