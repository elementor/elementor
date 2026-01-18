import * as React from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { Select, type SelectChangeEvent } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';

export function TimeFrameIndicator( { value, onChange }: FieldProps ) {
	const availableTimeFrames = [ '0', '100', '200', '300', '400', '500', '750', '1000', '1250', '1500' ].map(
		( key ) => ( {
			key,
			// translators: %s: time in milliseconds
			label: __( '%s MS', 'elementor' ).replace( '%s', key ),
		} )
	);

	return (
		<Select
			fullWidth
			displayEmpty
			size="tiny"
			value={ value }
			onChange={ ( event: SelectChangeEvent< string > ) => onChange( event.target.value ) }
		>
			{ availableTimeFrames.map( ( timeFrame ) => {
				return (
					<MenuListItem key={ timeFrame.key } value={ timeFrame.key }>
						{ timeFrame.label }
					</MenuListItem>
				);
			} ) }
		</Select>
	);
}
