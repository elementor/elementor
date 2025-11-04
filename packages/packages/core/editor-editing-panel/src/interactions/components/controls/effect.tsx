import * as React from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { Grid, Select, type SelectChangeEvent, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../../types/interactions';
export function Effect( { value, onChange }: FieldProps ) {
	const availableEffects = [
		{ key: 'fade', label: __( 'Fade', 'elementor' ) },
		{ key: 'slide', label: __( 'Slide', 'elementor' ) },
		{ key: 'scale', label: __( 'Scale', 'elementor' ) },
	];

	return (
		<>
			<Grid item xs={ 12 } md={ 6 }>
				<Typography variant="caption" color="text.secondary">
					{ __( 'Effect', 'elementor' ) }
				</Typography>
			</Grid>
			<Grid item xs={ 12 } md={ 6 }>
				<Select
					fullWidth
					displayEmpty
					size="tiny"
					value={ value }
					onChange={ ( event: SelectChangeEvent< string > ) => onChange( event.target.value ) }
				>
					{ availableEffects.map( ( effect ) => {
						return (
							<MenuListItem key={ effect.key } value={ effect.key }>
								{ effect.label }
							</MenuListItem>
						);
					} ) }
				</Select>
			</Grid>
		</>
	);
}
