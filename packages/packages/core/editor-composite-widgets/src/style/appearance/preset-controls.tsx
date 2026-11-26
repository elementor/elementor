import * as React from 'react';
import { ToggleButtonGroupUi } from '@elementor/editor-controls';
import { MenuListItem } from '@elementor/editor-ui';
import { Select, type SelectChangeEvent, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePreset } from './preset-context';

export const CUSTOM_LABEL = __( 'Custom', 'elementor' );

export function PresetToggle() {
	const { preset, matchedOptionId, apply } = usePreset();

	const items = preset.options.map( ( { id, label } ) => ( {
		value: id,
		label,
		renderContent: () => label,
	} ) );

	return (
		<ToggleButtonGroupUi< string | null >
			items={ items }
			value={ matchedOptionId }
			onChange={ ( optionId ) => optionId && apply( optionId ) }
			exclusive
			fullWidth
		/>
	);
}

export function PresetSelect() {
	const { preset, matchedOptionId, apply } = usePreset();

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
			value={ matchedOptionId ?? '' }
			renderValue={ renderValue }
			onChange={ ( event: SelectChangeEvent< string > ) => event.target.value && apply( event.target.value ) }
		>
			{ preset.options.map( ( { id, label } ) => (
				<MenuListItem key={ id } value={ id }>
					{ label }
				</MenuListItem>
			) ) }
		</Select>
	);
}
