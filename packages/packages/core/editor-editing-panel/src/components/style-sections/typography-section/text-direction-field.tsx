import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleControl } from '@elementor/editor-controls';
import { TextDirectionLtrIcon, TextDirectionRtlIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { StylesField, type StylesFieldLabelProps } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

type Direction = 'ltr' | 'rtl';

const TEXT_DIRECTION_LABEL = __( 'Direction', 'elementor' );

const options: ToggleButtonGroupItem< Direction >[] = [
	{
		value: 'ltr',
		label: __( 'Left to right', 'elementor' ),
		renderContent: ( { size } ) => <TextDirectionLtrIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'rtl',
		label: __( 'Right to left', 'elementor' ),
		renderContent: ( { size } ) => <TextDirectionRtlIcon fontSize={ size } />,
		showTooltip: true,
	},
];

export const TextDirectionField = ( { label = TEXT_DIRECTION_LABEL }: StylesFieldLabelProps ) => {
	return (
		<StylesField bind="direction" propDisplayName={ label }>
			<StylesFieldLayout label={ label }>
				<ToggleControl options={ options } />
			</StylesFieldLayout>
		</StylesField>
	);
};
