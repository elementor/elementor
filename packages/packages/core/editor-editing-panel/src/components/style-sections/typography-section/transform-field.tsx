import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleControl } from '@elementor/editor-controls';
import { LetterCaseIcon, LetterCaseLowerIcon, LetterCaseUpperIcon, MinusIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

type Transforms = 'none' | 'capitalize' | 'uppercase' | 'lowercase';

const TEXT_TRANSFORM_LABEL = __( 'Text transform', 'elementor' );

const options: ToggleButtonGroupItem< Transforms >[] = [
	{
		value: 'none',
		label: __( 'None', 'elementor' ),
		renderContent: ( { size } ) => <MinusIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'capitalize',
		label: __( 'Capitalize', 'elementor' ),
		renderContent: ( { size } ) => <LetterCaseIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'uppercase',
		label: __( 'Uppercase', 'elementor' ),
		renderContent: ( { size } ) => <LetterCaseUpperIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'lowercase',
		label: __( 'Lowercase', 'elementor' ),
		renderContent: ( { size } ) => <LetterCaseLowerIcon fontSize={ size } />,
		showTooltip: true,
	},
];

export const TransformField = () => (
	<StylesField bind="text-transform" propDisplayName={ TEXT_TRANSFORM_LABEL }>
		<StylesFieldLayout label={ TEXT_TRANSFORM_LABEL }>
			<ToggleControl options={ options } />
		</StylesFieldLayout>
	</StylesField>
);
