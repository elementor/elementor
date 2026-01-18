import * as React from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { Select, type SelectChangeEvent } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';

const EASING_OPTIONS = {
	easeIn: __( 'Ease In', 'elementor' ),
	easeInOut: __( 'Ease In Out', 'elementor' ),
	easeOut: __( 'Ease Out', 'elementor' ),
	backIn: __( 'Back In', 'elementor' ),
	backInOut: __( 'Back In Out', 'elementor' ),
	backOut: __( 'Back Out', 'elementor' ),
	linear: __( 'Linear', 'elementor' ),
};

export function Easing( { value, onChange }: FieldProps ) {
	const availableOptions = Object.entries( EASING_OPTIONS )
		.map( ( [ key, label ] ) => ( {
			key,
			label,
		} ) );

	return (
		<Select
			fullWidth
			displayEmpty
			size="tiny"
			onChange={ ( event: SelectChangeEvent< string > ) => onChange( event.target.value ) }
			value={ value }
		>
			{ availableOptions.map( ( option ) => {
				const isDisabled = 'easeIn' !== option.key;
				return (
					<MenuListItem key={ option.key } value={ option.key } disabled={ isDisabled }>
						{ option.label }
					</MenuListItem>
				);
			} ) }
		</Select>
	);
}
