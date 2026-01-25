import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleButtonGroupUi } from '@elementor/editor-controls';
import { CheckIcon, MinusIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ReplayFieldProps } from '../../types';

export function Replay( { disabled = true }: ReplayFieldProps ) {
	const options: ToggleButtonGroupItem< boolean >[] = [
		{
			value: false,
			label: __( 'No', 'elementor' ),
			renderContent: ( { size } ) => <MinusIcon fontSize={ size } />,
		},
		{
			value: true,
			label: __( 'Yes', 'elementor' ),
			renderContent: ( { size } ) => <CheckIcon fontSize={ size } />,
		},
	];

	return (
		<ToggleButtonGroupUi items={ options } exclusive onChange={ () => {} } value={ false } disabled={ disabled } />
	);
}
