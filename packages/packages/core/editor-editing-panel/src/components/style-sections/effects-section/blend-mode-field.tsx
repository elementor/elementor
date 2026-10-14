import * as React from 'react';
import { SelectControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const BLEND_MODE_LABEL = __( 'Blend mode', 'elementor' );

const blendModeOptions = [
	{ label: __( 'Normal', 'elementor' ), value: 'normal' },
	{ label: __( 'Multiply', 'elementor' ), value: 'multiply' },
	{ label: __( 'Screen', 'elementor' ), value: 'screen' },
	{ label: __( 'Overlay', 'elementor' ), value: 'overlay' },
	{ label: __( 'Darken', 'elementor' ), value: 'darken' },
	{ label: __( 'Lighten', 'elementor' ), value: 'lighten' },
	{ label: __( 'Color dodge', 'elementor' ), value: 'color-dodge' },
	{ label: __( 'Color burn', 'elementor' ), value: 'color-burn' },
	{ label: __( 'Saturation', 'elementor' ), value: 'saturation' },
	{ label: __( 'Color', 'elementor' ), value: 'color' },
	{ label: __( 'Difference', 'elementor' ), value: 'difference' },
	{ label: __( 'Exclusion', 'elementor' ), value: 'exclusion' },
	{ label: __( 'Hue', 'elementor' ), value: 'hue' },
	{ label: __( 'Luminosity', 'elementor' ), value: 'luminosity' },
	{ label: __( 'Soft light', 'elementor' ), value: 'soft-light' },
	{ label: __( 'Hard light', 'elementor' ), value: 'hard-light' },
];

export const BlendModeField = () => {
	return (
		<StylesField bind="mix-blend-mode" propDisplayName={ BLEND_MODE_LABEL }>
			<StylesFieldLayout label={ BLEND_MODE_LABEL }>
				<SelectControl options={ blendModeOptions } />
			</StylesFieldLayout>
		</StylesField>
	);
};
