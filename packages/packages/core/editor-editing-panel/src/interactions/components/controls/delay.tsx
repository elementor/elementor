import * as React from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { Grid, Select, type SelectChangeEvent, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../../types/interactions';

export function Delay( { value, onChange }: FieldProps ) {
	const availableDelays = [
		{ key: '0', label: __( '0 MS', 'elementor' ) },
		{ key: '100', label: __( '100 MS', 'elementor' ) },
		{ key: '200', label: __( '200 MS', 'elementor' ) },
		{ key: '300', label: __( '300 MS', 'elementor' ) },
		{ key: '400', label: __( '400 MS', 'elementor' ) },
		{ key: '500', label: __( '500 MS', 'elementor' ) },
	];

	return (
		<>
			<Grid item xs={ 12 } md={ 6 }>
				<Typography variant="caption" color="text.secondary">
					{ __( 'Delay', 'elementor' ) }
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
					{ availableDelays.map( ( delay ) => {
						return (
							<MenuListItem key={ delay.key } value={ delay.key }>
								{ delay.label }
							</MenuListItem>
						);
					} ) }
				</Select>
			</Grid>
		</>
	);
}
