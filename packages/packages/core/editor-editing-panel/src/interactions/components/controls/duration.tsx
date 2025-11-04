import * as React from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { Grid, Select, type SelectChangeEvent, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../../types/interactions';

export function Duration( { value, onChange }: FieldProps ) {
	const availableDurations = [
		{ key: '100', label: __( '100 MS', 'elementor' ) },
		{ key: '200', label: __( '200 MS', 'elementor' ) },
		{ key: '300', label: __( '300 MS', 'elementor' ) },
		{ key: '400', label: __( '400 MS', 'elementor' ) },
		{ key: '500', label: __( '500 MS', 'elementor' ) },
		{ key: '750', label: __( '750 MS', 'elementor' ) },
		{ key: '1000', label: __( '1000 MS', 'elementor' ) },
		{ key: '1250', label: __( '1250 MS', 'elementor' ) },
		{ key: '1500', label: __( '1500 MS', 'elementor' ) },
	];

	return (
		<>
			<Grid item xs={ 12 } md={ 6 }>
				<Typography variant="caption" color="text.secondary">
					{ __( 'Duration', 'elementor' ) }
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
					{ availableDurations.map( ( duration ) => {
						return (
							<MenuListItem key={ duration.key } value={ duration.key }>
								{ duration.label }
							</MenuListItem>
						);
					} ) }
				</Select>
			</Grid>
		</>
	);
}
