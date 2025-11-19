import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleButtonGroupUi } from '@elementor/editor-controls';
import { Grid, Typography } from '@elementor/ui';
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
			label: __( 'out', 'elementor' ),
			renderContent: () => __( 'out', 'elementor' ),
			showTooltip: true,
		},
	];

	return (
		<>
			<Grid item xs={ 12 } md={ 6 }>
				<Typography variant="caption" color="text.secondary">
					{ __( 'Type', 'elementor' ) }
				</Typography>
			</Grid>
			<Grid item xs={ 12 } md={ 6 } sx={ { display: 'flex', justifyContent: 'flex-end', overflow: 'hidden' } }>
				<ToggleButtonGroupUi items={ options } exclusive onChange={ onChange } value={ value } />
			</Grid>
		</>
	);
}
