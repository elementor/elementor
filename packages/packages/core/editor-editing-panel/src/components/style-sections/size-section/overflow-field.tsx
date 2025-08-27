import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleControl } from '@elementor/editor-controls';
import { EyeIcon, EyeOffIcon, LetterAIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

type Overflows = 'visible' | 'hidden' | 'auto';

const OVERFLOW_LABEL = __( 'Overflow', 'elementor' );

const options: ToggleButtonGroupItem< Overflows >[] = [
	{
		value: 'visible',
		label: __( 'Visible', 'elementor' ),
		renderContent: ( { size } ) => <EyeIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'hidden',
		label: __( 'Hidden', 'elementor' ),
		renderContent: ( { size } ) => <EyeOffIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'auto',
		label: __( 'Auto', 'elementor' ),
		renderContent: ( { size } ) => <LetterAIcon fontSize={ size } />,
		showTooltip: true,
	},
];

export const OverflowField = () => {
	return (
		<StylesField bind="overflow" propDisplayName={ OVERFLOW_LABEL }>
			<StylesFieldLayout label={ OVERFLOW_LABEL }>
				<ToggleControl options={ options } />
			</StylesFieldLayout>
		</StylesField>
	);
};
