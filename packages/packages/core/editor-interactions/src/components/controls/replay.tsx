import * as React from 'react';
import {
	ControlFormLabel,
	PopoverGridContainer,
	type ToggleButtonGroupItem,
	ToggleButtonGroupUi,
} from '@elementor/editor-controls';
import { CheckIcon, MinusIcon } from '@elementor/icons';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ReplayFieldProps } from '../../types';

export function Replay( { disabled = true }: ReplayFieldProps ) {
	const options: ToggleButtonGroupItem< boolean >[] = [
		{
			value: true,
			label: __( 'Yes', 'elementor' ),
			renderContent: ( { size } ) => <CheckIcon fontSize={ size } />,
		},
		{
			value: false,
			label: __( 'No', 'elementor' ),
			renderContent: ( { size } ) => <MinusIcon fontSize={ size } />,
		},
	];

	return (
		<Grid item xs={ 12 }>
			<PopoverGridContainer>
				<Grid item xs={ 6 }>
					<ControlFormLabel>{ __( 'Replay', 'elementor' ) }</ControlFormLabel>
				</Grid>
				<Grid item xs={ 6 }>
					<ToggleButtonGroupUi
						items={ options }
						exclusive
						onChange={ () => {} }
						value={ false }
						disabled={ disabled }
					/>
				</Grid>
			</PopoverGridContainer>
		</Grid>
	);
}
