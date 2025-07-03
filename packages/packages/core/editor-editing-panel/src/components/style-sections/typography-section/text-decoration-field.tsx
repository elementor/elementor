import * as React from 'react';
import { ToggleControl, type ToggleControlProps } from '@elementor/editor-controls';
import { MinusIcon, OverlineIcon, StrikethroughIcon, UnderlineIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

type Decoration = 'none' | 'underline' | 'line-through' | 'overline';

const TEXT_DECORATION_LABEL = __( 'Line decoration', 'elementor' );

const options: ToggleControlProps< Decoration >[ 'options' ] = [
	{
		value: 'none',
		label: __( 'None', 'elementor' ),
		renderContent: ( { size } ) => <MinusIcon fontSize={ size } />,
		showTooltip: true,
		exclusive: true,
	},
	{
		value: 'underline',
		label: __( 'Underline', 'elementor' ),
		renderContent: ( { size } ) => <UnderlineIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'line-through',
		label: __( 'Line-through', 'elementor' ),
		renderContent: ( { size } ) => <StrikethroughIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'overline',
		label: __( 'Overline', 'elementor' ),
		renderContent: ( { size } ) => <OverlineIcon fontSize={ size } />,
		showTooltip: true,
	},
];
export const TextDecorationField = () => (
	<StylesField bind="text-decoration" propDisplayName={ TEXT_DECORATION_LABEL }>
		<StylesFieldLayout label={ TEXT_DECORATION_LABEL }>
			<ToggleControl options={ options } exclusive={ false } />
		</StylesFieldLayout>
	</StylesField>
);
