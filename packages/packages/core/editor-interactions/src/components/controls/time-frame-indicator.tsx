import * as React from 'react';
import { ControlFormLabel, PopoverGridContainer } from '@elementor/editor-controls';
import { MenuListItem } from '@elementor/editor-ui';
import { Grid, Select, type SelectChangeEvent } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';

export function TimeFrameIndicator( { value, onChange, label }: FieldProps ) {
	const availableTimeFrames = [ '0', '100', '200', '300', '400', '500', '750', '1000', '1250', '1500' ].map(
		( key ) => ( {
			key,
			// translators: %s: time in milliseconds
			label: __( '%s MS', 'elementor' ).replace( '%s', key ),
		} )
	);

	return (
		<Grid item xs={ 12 }>
			<PopoverGridContainer>
				<Grid item xs={ 6 }>
					<ControlFormLabel>{ label }</ControlFormLabel>
				</Grid>
				<Grid item xs={ 6 }>
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
				</Grid>
			</PopoverGridContainer>
		</Grid>
	);
}
