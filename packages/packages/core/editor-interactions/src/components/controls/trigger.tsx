import * as React from 'react';
import { ControlFormLabel, PopoverGridContainer } from '@elementor/editor-controls';
import { MenuListItem } from '@elementor/editor-ui';
import { Grid, Select, type SelectChangeEvent } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';

export function Trigger( { value, onChange }: FieldProps ) {
	const availableTriggers = Object.entries( {
		load: __( 'Page load', 'elementor' ),
		scrollIn: __( 'Scroll into view', 'elementor' ),
	} ).map( ( [ key, label ] ) => ( {
		key,
		label,
	} ) );

	return (
		<Grid item xs={ 12 }>
			<PopoverGridContainer>
				<Grid item xs={ 6 }>
					<ControlFormLabel>{ __( 'Trigger', 'elementor' ) }</ControlFormLabel>
				</Grid>
				<Grid item xs={ 6 }>
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
			</PopoverGridContainer>
		</Grid>
	);
}
