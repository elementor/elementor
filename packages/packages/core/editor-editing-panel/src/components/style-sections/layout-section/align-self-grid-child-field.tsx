import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleControl } from '@elementor/editor-controls';
import {
	JustifyBottomIcon,
	JustifyCenterIcon,
	JustifyTopIcon,
	LayoutDistributeVerticalIcon as JustifyIcon,
} from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { StylesFieldLayout } from '../../styles-field-layout';
import { RotatedIcon } from './utils/rotated-icon';

type AlignSelf = 'start' | 'center' | 'end' | 'stretch';

const ALIGN_SELF_LABEL = __( 'Align self', 'elementor' );

const options: ToggleButtonGroupItem< AlignSelf >[] = [
	{
		value: 'start',
		label: __( 'Start', 'elementor' ),
		renderContent: ( { size } ) => <RotatedIcon icon={ JustifyTopIcon } size={ size } />,
		showTooltip: true,
	},
	{
		value: 'center',
		label: __( 'Center', 'elementor' ),
		renderContent: ( { size } ) => <RotatedIcon icon={ JustifyCenterIcon } size={ size } />,
		showTooltip: true,
	},
	{
		value: 'end',
		label: __( 'End', 'elementor' ),
		renderContent: ( { size } ) => <RotatedIcon icon={ JustifyBottomIcon } size={ size } />,
		showTooltip: true,
	},
	{
		value: 'stretch',
		label: __( 'Stretch', 'elementor' ),
		renderContent: ( { size } ) => <RotatedIcon icon={ JustifyIcon } size={ size } />,
		showTooltip: true,
	},
];

export const AlignSelfGridChild = () => (
	<StylesField bind="align-self" propDisplayName={ ALIGN_SELF_LABEL }>
		<UiProviders>
			<StylesFieldLayout label={ ALIGN_SELF_LABEL }>
				<ToggleControl options={ options } />
			</StylesFieldLayout>
		</UiProviders>
	</StylesField>
);
