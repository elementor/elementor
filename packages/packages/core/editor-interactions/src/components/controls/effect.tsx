import * as React from 'react';
import { ControlFormLabel, PopoverGridContainer } from '@elementor/editor-controls';
import { MenuListItem } from '@elementor/editor-ui';
import { Grid, Select, type SelectChangeEvent } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';
export function Effect( { value, onChange }: FieldProps ) {
	const availableEffects = [
		{ key: 'fade', label: __( 'Fade', 'elementor' ) },
		{ key: 'slide', label: __( 'Slide', 'elementor' ) },
		{ key: 'scale', label: __( 'Scale', 'elementor' ) },
	];

	return (
		<Grid item xs={ 12 }>
			<PopoverGridContainer>
				<Grid item xs={ 6 }>
					<ControlFormLabel>{ __( 'Effect', 'elementor' ) }</ControlFormLabel>
				</Grid>
				<Grid item xs={ 6 }>
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
			</PopoverGridContainer>
		</Grid>
	);
}
