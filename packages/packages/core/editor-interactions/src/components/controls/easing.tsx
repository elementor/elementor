import * as React from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { Select } from '@elementor/ui';
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

const DEFAULT_EASING = 'easeIn';

export function Easing( {}: FieldProps ) {
	const availableOptions = Object.entries( EASING_OPTIONS ).map( ( [ key, label ] ) => ( {
		key,
		label,
	} ) );

	return (
		<Select value={ DEFAULT_EASING } onChange={ () => {} } fullWidth displayEmpty size="tiny">
			{ availableOptions.map( ( option ) => {
				const isDisabled = DEFAULT_EASING !== option.key;
				return (
					<MenuListItem key={ option.key } value={ option.key } disabled={ isDisabled }>
						{ option.label }
					</MenuListItem>
				);
			} ) }
		</Select>
	);
}
