import * as React from 'react';
import {
	ControlFormLabel,
	PopoverGridContainer,
	type ToggleButtonGroupItem,
	ToggleButtonGroupUi,
} from '@elementor/editor-controls';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';

type EffectType = 'in' | 'out';
export function EffectType( { value, onChange }: FieldProps ) {
	const options: ToggleButtonGroupItem< EffectType >[] = [
		{
			value: 'in',
			label: __( 'In', 'elementor' ),
			renderContent: () => __( 'In', 'elementor' ),
			showTooltip: true,
		},
		{
			value: 'out',
			label: __( 'Out', 'elementor' ),
			renderContent: () => __( 'Out', 'elementor' ),
			showTooltip: true,
		},
	];

	return (
		<>
			<Grid item xs={ 12 }>
				<PopoverGridContainer>
					<Grid item xs={ 6 }>
						<ControlFormLabel>{ __( 'Type', 'elementor' ) }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 6 }>
						<ToggleButtonGroupUi items={ options } exclusive onChange={ onChange } value={ value } />
					</Grid>
				</PopoverGridContainer>
			</Grid>
		</>
	);
}
