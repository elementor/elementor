import * as React from 'react';
import { Grid, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';

export function EffectType( { value, onChange }: FieldProps ) {
	const availableEffectTypes = [
		{ key: 'in', label: __( 'In', 'elementor' ) },
		{ key: 'out', label: __( 'Out', 'elementor' ) },
	];

	return (
		<>
			<Grid item xs={ 12 } md={ 6 }>
				<Typography variant="caption" color="text.secondary">
					{ __( 'Type', 'elementor' ) }
				</Typography>
			</Grid>
			<Grid item xs={ 12 } md={ 6 } sx={ { display: 'flex', justifyContent: 'flex-end', overflow: 'hidden' } }>
				<ToggleButtonGroup
					size="tiny"
					exclusive
					onChange={ ( event: React.MouseEvent< HTMLElement >, newValue: string ) => onChange( newValue ) }
					value={ value }
				>
					{ availableEffectTypes.map( ( effectType ) => {
						return (
							<Tooltip key={ effectType.key } title={ effectType.label } placement="top">
								<ToggleButton key={ effectType.key } value={ effectType.key }>
									{ effectType.label }
								</ToggleButton>
							</Tooltip>
						);
					} ) }
				</ToggleButtonGroup>
			</Grid>
		</>
	);
}
