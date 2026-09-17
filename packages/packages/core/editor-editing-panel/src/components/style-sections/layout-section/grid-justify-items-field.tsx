import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleControl } from '@elementor/editor-controls';
import {
	LayoutAlignCenterIcon as CenterIcon,
	LayoutAlignLeftIcon,
	LayoutAlignRightIcon,
	LayoutDistributeVerticalIcon as StretchIcon,
} from '@elementor/icons';
import { withDirection } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { StylesFieldLayout } from '../../styles-field-layout';

type JustifyItems = 'start' | 'center' | 'end' | 'stretch';

const JUSTIFY_ITEMS_LABEL = __( 'Justify items', 'elementor' );

const StartIcon = withDirection( LayoutAlignLeftIcon );
const EndIcon = withDirection( LayoutAlignRightIcon );

const options: ToggleButtonGroupItem< JustifyItems >[] = [
	{
		value: 'start',
		label: __( 'Start', 'elementor' ),
		renderContent: ( { size } ) => <StartIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'center',
		label: __( 'Center', 'elementor' ),
		renderContent: ( { size } ) => <CenterIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'end',
		label: __( 'End', 'elementor' ),
		renderContent: ( { size } ) => <EndIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'stretch',
		label: __( 'Stretch', 'elementor' ),
		renderContent: ( { size } ) => <StretchIcon fontSize={ size } />,
		showTooltip: true,
	},
];

export const GridJustifyItemsField = () => (
	<StylesField bind="justify-items" propDisplayName={ JUSTIFY_ITEMS_LABEL }>
		<UiProviders>
			<StylesFieldLayout label={ JUSTIFY_ITEMS_LABEL }>
				<ToggleControl options={ options } />
			</StylesFieldLayout>
		</UiProviders>
	</StylesField>
);
