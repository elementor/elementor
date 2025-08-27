import * as React from 'react';
import { SelectControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const FONT_WEIGHT_LABEL = __( 'Font weight', 'elementor' );

const fontWeightOptions = [
	{ value: '100', label: __( '100 - Thin', 'elementor' ) },
	{ value: '200', label: __( '200 - Extra light', 'elementor' ) },
	{ value: '300', label: __( '300 - Light', 'elementor' ) },
	{ value: '400', label: __( '400 - Normal', 'elementor' ) },
	{ value: '500', label: __( '500 - Medium', 'elementor' ) },
	{ value: '600', label: __( '600 - Semi bold', 'elementor' ) },
	{ value: '700', label: __( '700 - Bold', 'elementor' ) },
	{ value: '800', label: __( '800 - Extra bold', 'elementor' ) },
	{ value: '900', label: __( '900 - Black', 'elementor' ) },
];

export const FontWeightField = () => {
	return (
		<StylesField bind="font-weight" propDisplayName={ FONT_WEIGHT_LABEL }>
			<StylesFieldLayout label={ FONT_WEIGHT_LABEL }>
				<SelectControl options={ fontWeightOptions } />
			</StylesFieldLayout>
		</StylesField>
	);
};
