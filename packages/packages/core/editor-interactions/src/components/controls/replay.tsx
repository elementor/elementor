import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleButtonGroupUi } from '@elementor/editor-controls';
import { CheckIcon, MinusIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ReplayFieldProps } from '../../types';

export function Replay( { onChange }: ReplayFieldProps ) {
	const options: ToggleButtonGroupItem< boolean >[] = [
		{
			value: false,
			disabled: false,
			label: __( 'No', 'elementor' ),
			renderContent: ( { size } ) => <MinusIcon fontSize={ size } />,
		},
		{
			value: true,
			disabled: true,
			label: __( 'Yes', 'elementor' ),
			renderContent: ( { size } ) => <CheckIcon fontSize={ size } />,
		},
	];

	return <ToggleButtonGroupUi items={ options } exclusive onChange={ onChange } value={ false } />;
}
