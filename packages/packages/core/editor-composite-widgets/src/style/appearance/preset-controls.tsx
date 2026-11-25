import * as React from 'react';
import { ToggleButtonGroupUi } from '@elementor/editor-controls';
import { MenuListItem } from '@elementor/editor-ui';
import { Select, type SelectChangeEvent, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type CompositeWidgetPreset } from '../../types';

export type PresetControlProps = {
	preset: CompositeWidgetPreset;
	value: string | null;
	onChange: ( optionId: string ) => void;
};

export const CUSTOM_LABEL = __( 'Custom', 'elementor' );

export function PresetToggle( { preset, value, onChange }: PresetControlProps ) {
	const items = preset.options.map( ( { id, label } ) => ( {
		value: id,
		label,
		renderContent: () => label,
	} ) );

	return (
		<ToggleButtonGroupUi< string | null >
			items={ items }
			value={ value }
			onChange={ ( optionId ) => optionId && onChange( optionId ) }
			exclusive
			fullWidth
		/>
	);
}

export function PresetSelect( { preset, value, onChange }: PresetControlProps ) {
	const renderValue = ( optionId: string ) =>
		preset.options.find( ( { id } ) => id === optionId )?.label ?? (
			<Typography fontSize="inherit" color="text.tertiary">
				{ CUSTOM_LABEL }
			</Typography>
		);

	return (
		<Select
			size="tiny"
			fullWidth
			displayEmpty
			SelectDisplayProps={ { 'aria-label': preset.label } }
			value={ value ?? '' }
			renderValue={ renderValue }
			onChange={ ( event: SelectChangeEvent< string > ) => event.target.value && onChange( event.target.value ) }
		>
			{ preset.options.map( ( { id, label } ) => (
				<MenuListItem key={ id } value={ id }>
					{ label }
				</MenuListItem>
			) ) }
		</Select>
	);
}
