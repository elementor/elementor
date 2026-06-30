import * as React from 'react';
import { SelectControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const BORDER_TYPE_LABEL = __( 'Border type', 'elementor' );

const borderStyles = [
	{ value: 'none', label: __( 'None', 'elementor' ) },
	{ value: 'solid', label: __( 'Solid', 'elementor' ) },
	{ value: 'dashed', label: __( 'Dashed', 'elementor' ) },
	{ value: 'dotted', label: __( 'Dotted', 'elementor' ) },
	{ value: 'double', label: __( 'Double', 'elementor' ) },
	{ value: 'groove', label: __( 'Groove', 'elementor' ) },
	{ value: 'ridge', label: __( 'Ridge', 'elementor' ) },
	{ value: 'inset', label: __( 'Inset', 'elementor' ) },
	{ value: 'outset', label: __( 'Outset', 'elementor' ) },
];

export const BorderStyleField = () => (
	<StylesField bind="border-style" propDisplayName={ BORDER_TYPE_LABEL }>
		<StylesFieldLayout label={ BORDER_TYPE_LABEL }>
			<SelectControl options={ borderStyles } />
		</StylesFieldLayout>
	</StylesField>
);
