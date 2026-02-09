import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

type EffectType = 'in' | 'out';

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

export const EffectType = () => {
	return <ToggleControl options={ options } />;
};
