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

type JustifyItems = 'stretch' | 'center' | 'start' | 'end';

const JUSTIFY_ITEMS_LABEL = __( 'Justify items', 'elementor' );

const StartIcon = withDirection( LayoutAlignLeftIcon );
const EndIcon = withDirection( LayoutAlignRightIcon );

const iconProps = {
	isClockwise: false,
	offset: 90,
};

const options: ToggleButtonGroupItem< JustifyItems >[] = [
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

export const JustifyItemsField = () => {
	return (
		<UiProviders>
			<StylesField bind="justify-items" propDisplayName={ JUSTIFY_ITEMS_LABEL }>
				<StylesFieldLayout label={ JUSTIFY_ITEMS_LABEL }>
					<ToggleControl options={ options } />
				</StylesFieldLayout>
			</StylesField>
		</UiProviders>
	);
};
