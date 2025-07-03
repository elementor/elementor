import * as React from 'react';
import { DotsHorizontalIcon, DotsVerticalIcon, GridDotsIcon, XIcon } from '@elementor/icons';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ControlFormLabel } from '../../../../components/control-form-label';
import { type ToggleButtonGroupItem } from '../../../../components/control-toggle-button-group';
import { PopoverGridContainer } from '../../../../components/popover-grid-container';
import { ToggleControl } from '../../../toggle-control';

type Repeaters = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';

const repeatControlOptions: ToggleButtonGroupItem< Repeaters >[] = [
	{
		value: 'repeat',
		label: __( 'Repeat', 'elementor' ),
		renderContent: ( { size } ) => <GridDotsIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'repeat-x',
		label: __( 'Repeat-x', 'elementor' ),
		renderContent: ( { size } ) => <DotsHorizontalIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'repeat-y',
		label: __( 'Repeat-y', 'elementor' ),
		renderContent: ( { size } ) => <DotsVerticalIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'no-repeat',
		label: __( 'No-repeat', 'elementor' ),
		renderContent: ( { size } ) => <XIcon fontSize={ size } />,
		showTooltip: true,
	},
];

export const BackgroundImageOverlayRepeat = () => {
	return (
		<PopoverGridContainer>
			<Grid item xs={ 6 }>
				<ControlFormLabel>{ __( 'Repeat', 'elementor' ) }</ControlFormLabel>
			</Grid>
			<Grid item xs={ 6 } sx={ { display: 'flex', justifyContent: 'flex-end' } }>
				<ToggleControl options={ repeatControlOptions } />
			</Grid>
		</PopoverGridContainer>
	);
};
