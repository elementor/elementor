import * as React from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { Select, type SelectChangeEvent } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';

const TRIGGER_OPTIONS = {
	load: __( 'Page load', 'elementor' ),
	scrollIn: __( 'Scroll into view', 'elementor' ),
	scrollOn: __( 'While scrolling', 'elementor' ),
	hover: __( 'On hover', 'elementor' ),
	click: __( 'On click', 'elementor' ),
};

const SUPPORTED_TRIGGERS = ['load', 'scrollIn'];

export function Trigger( { value, onChange }: FieldProps ) {
	const availableTriggers = Object.entries( TRIGGER_OPTIONS ).map( ( [ key, label ] ) => ( {
		key,
		label,
		disabled: ! SUPPORTED_TRIGGERS.includes( key ),
	} ) );

	return (
		<Select
			fullWidth
			displayEmpty
			size="tiny"
			onChange={ ( event: SelectChangeEvent< string > ) => onChange( event.target.value ) }
			value={ value }
		>
			{ availableTriggers.map( ( trigger ) => {
				return (
					<MenuListItem key={ trigger.key } value={ trigger.key } disabled={ trigger.disabled }>
						{ trigger.label }
					</MenuListItem>
				);
			} ) }
		</Select>
	);
}
