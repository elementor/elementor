import * as React from 'react';
import { PinIcon, PinnedOffIcon } from '@elementor/icons';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ControlFormLabel } from '../../../../components/control-form-label';
import { type ToggleButtonGroupItem } from '../../../../components/control-toggle-button-group';
import { PopoverGridContainer } from '../../../../components/popover-grid-container';
import { ToggleControl } from '../../../toggle-control';

type Attachment = 'fixed' | 'scroll';

const attachmentControlOptions: ToggleButtonGroupItem< Attachment >[] = [
	{
		value: 'fixed',
		label: __( 'Fixed', 'elementor' ),
		renderContent: ( { size } ) => <PinIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'scroll',
		label: __( 'Scroll', 'elementor' ),
		renderContent: ( { size } ) => <PinnedOffIcon fontSize={ size } />,
		showTooltip: true,
	},
];

export const BackgroundImageOverlayAttachment = () => {
	return (
		<PopoverGridContainer>
			<Grid item xs={ 6 }>
				<ControlFormLabel>{ __( 'Attachment', 'elementor' ) }</ControlFormLabel>
			</Grid>
			<Grid item xs={ 6 } sx={ { display: 'flex', justifyContent: 'flex-end', overflow: 'hidden' } }>
				<ToggleControl options={ attachmentControlOptions } />
			</Grid>
		</PopoverGridContainer>
	);
};
