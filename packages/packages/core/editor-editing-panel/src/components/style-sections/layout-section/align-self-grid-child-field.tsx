import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleControl } from '@elementor/editor-controls';
import {
	LayoutAlignCenterIcon as CenterIcon,
	LayoutAlignLeftIcon,
	LayoutAlignRightIcon,
	LayoutDistributeVerticalIcon as JustifyIcon,
} from '@elementor/icons';
import { withDirection } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { StylesFieldLayout } from '../../styles-field-layout';
import { RotatedIcon } from './utils/rotated-icon';

type AlignSelf = 'start' | 'center' | 'end' | 'stretch';

const ALIGN_SELF_LABEL = __( 'Align self', 'elementor' );

const ICON_OFFSET = 90;

const StartIcon = withDirection( LayoutAlignLeftIcon );
const EndIcon = withDirection( LayoutAlignRightIcon );

const iconProps = {
	isClockwise: false,
	offset: ICON_OFFSET,
};

const options: ToggleButtonGroupItem< AlignSelf >[] = [
	{
		value: 'start',
		label: __( 'Start', 'elementor' ),
		renderContent: ( { size } ) => <RotatedIcon icon={ StartIcon } size={ size } { ...iconProps } />,
		showTooltip: true,
	},
	{
		value: 'center',
		label: __( 'Center', 'elementor' ),
		renderContent: ( { size } ) => <RotatedIcon icon={ CenterIcon } size={ size } { ...iconProps } />,
		showTooltip: true,
	},
	{
		value: 'end',
		label: __( 'End', 'elementor' ),
		renderContent: ( { size } ) => <RotatedIcon icon={ EndIcon } size={ size } { ...iconProps } />,
		showTooltip: true,
	},
	{
		value: 'stretch',
		label: __( 'Stretch', 'elementor' ),
		renderContent: ( { size } ) => <RotatedIcon icon={ JustifyIcon } size={ size } { ...iconProps } />,
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
