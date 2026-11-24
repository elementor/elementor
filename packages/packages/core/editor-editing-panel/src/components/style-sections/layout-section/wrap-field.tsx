import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleControl } from '@elementor/editor-controls';
import { ArrowBackIcon, ArrowForwardIcon, ArrowRightIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { StylesField, type StylesFieldLabelProps } from '../../../controls-registry/styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { StylesFieldLayout } from '../../styles-field-layout';

type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

const FLEX_WRAP_LABEL = __( 'Wrap', 'elementor' );

const options: ToggleButtonGroupItem< FlexWrap >[] = [
	{
		value: 'nowrap',
		label: __( 'No wrap', 'elementor' ),
		renderContent: ( { size } ) => <ArrowRightIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'wrap',
		label: __( 'Wrap', 'elementor' ),
		renderContent: ( { size } ) => <ArrowBackIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'wrap-reverse',
		label: __( 'Reversed wrap', 'elementor' ),
		renderContent: ( { size } ) => <ArrowForwardIcon fontSize={ size } />,
		showTooltip: true,
	},
];

export const WrapField = ( { label = FLEX_WRAP_LABEL }: StylesFieldLabelProps ) => {
	return (
		<StylesField bind="flex-wrap" propDisplayName={ label }>
			<UiProviders>
				<StylesFieldLayout label={ label }>
					<ToggleControl options={ options } />
				</StylesFieldLayout>
			</UiProviders>
		</StylesField>
	);
};
