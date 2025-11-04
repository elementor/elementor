import * as React from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { Grid, Select, type SelectChangeEvent, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../../types/interactions';

export function Trigger( { value, onChange }: FieldProps ) {
	const availableTriggers = Object.entries( {
		load: __( 'Page load', 'elementor' ),
		scrollIn: __( 'Scroll into view', 'elementor' ),
		scrollOut: __( 'Scroll out of view', 'elementor' ),
	} ).map( ( [ key, label ] ) => ( {
		key,
		label,
	} ) );

	return (
		<>
			<Grid item xs={ 12 } md={ 6 }>
				<Typography variant="caption" color="text.secondary">
					{ __( 'Trigger', 'elementor' ) }
				</Typography>
			</Grid>
			<Grid item xs={ 12 } md={ 6 }>
				<Select
					fullWidth
					displayEmpty
					size="tiny"
					onChange={ ( event: SelectChangeEvent< string > ) => onChange( event.target.value ) }
					value={ value }
				>
					{ availableTriggers.map( ( trigger ) => {
						return (
							<MenuListItem key={ trigger.key } value={ trigger.key }>
								{ trigger.label }
							</MenuListItem>
						);
					} ) }
				</Select>
			</Grid>
		</>
	);
}
