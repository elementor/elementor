import * as React from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { Select, type SelectChangeEvent } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';

export function Effect( { value, onChange }: FieldProps ) {
	const availableEffects = [
		{ key: 'fade', label: __( 'Fade', 'elementor' ) },
		{ key: 'slide', label: __( 'Slide', 'elementor' ) },
		{ key: 'scale', label: __( 'Scale', 'elementor' ) },
		{ key: 'custom', label: __( 'Custom', 'elementor' ), disabled: true },
	];

	return (
		<Select
			fullWidth
			displayEmpty
			size="tiny"
			value={ value }
			onChange={ ( event: SelectChangeEvent< string > ) => onChange( event.target.value ) }
			MenuProps={ { disablePortal: true } }
		>
			{ availableEffects.map( ( effect ) => {
				return (
					<MenuListItem key={ effect.key } value={ effect.key } disabled={ effect.disabled }>
						{ effect.label }
					</MenuListItem>
				);
			} ) }
		</Select>
	);
}
