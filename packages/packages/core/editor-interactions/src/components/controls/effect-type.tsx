import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleButtonGroupUi } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';

type EffectType = 'in' | 'out';

export function EffectType( { value, onChange }: FieldProps ) {
	const options: ToggleButtonGroupItem< EffectType >[] = [
		{
			value: 'in',
			label: __( 'In', 'elementor' ),
			renderContent: () => __( 'In', 'elementor' ),
			showTooltip: true,
		},
		{
			value: 'out',
			label: __( 'Out', 'elementor' ),
			renderContent: () => __( 'Out', 'elementor' ),
			showTooltip: true,
		},
	];

	return <ToggleButtonGroupUi items={ options } exclusive onChange={ onChange } value={ value } />;
}
