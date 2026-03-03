import * as React from 'react';
import { ToggleControl } from '@elementor/editor-controls';
import {
	LayoutAlignCenterIcon as CenterIcon,
	LayoutAlignLeftIcon,
	LayoutAlignRightIcon,
	LayoutDistributeVerticalIcon as JustifyIcon,
} from '@elementor/icons';
import { type ToggleButtonProps, withDirection } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { StylesFieldLayout } from '../../styles-field-layout';
import { type FlexDirection } from './flex-direction-field';
import { RotatedIcon } from './utils/rotated-icon';

const ALIGN_SELF_LABEL = __( 'Align self', 'elementor' );

const ALIGN_SELF_CHILD_OFFSET_MAP: Record< FlexDirection, number > = {
	row: 90,
	'row-reverse': 90,
	column: 0,
	'column-reverse': 0,
};

const StartIcon = withDirection( LayoutAlignLeftIcon );
const EndIcon = withDirection( LayoutAlignRightIcon );

const iconProps = {
	isClockwise: false,
};

const getOptions = ( parentStyleDirection: FlexDirection ) => [
	{
		value: 'start',
		label: __( 'Start', 'elementor' ),
		renderContent: ( { size }: { size: ToggleButtonProps[ 'size' ] } ) => (
			<RotatedIcon
				icon={ StartIcon }
				size={ size }
				offset={ ALIGN_SELF_CHILD_OFFSET_MAP[ parentStyleDirection ] }
				{ ...iconProps }
			/>
		),
		showTooltip: true,
	},
	{
		value: 'center',
		label: __( 'Center', 'elementor' ),
		renderContent: ( { size }: { size: ToggleButtonProps[ 'size' ] } ) => (
			<RotatedIcon
				icon={ CenterIcon }
				size={ size }
				offset={ ALIGN_SELF_CHILD_OFFSET_MAP[ parentStyleDirection ] }
				{ ...iconProps }
			/>
		),
		showTooltip: true,
	},
	{
		value: 'end',
		label: __( 'End', 'elementor' ),
		renderContent: ( { size }: { size: ToggleButtonProps[ 'size' ] } ) => (
			<RotatedIcon
				icon={ EndIcon }
				size={ size }
				offset={ ALIGN_SELF_CHILD_OFFSET_MAP[ parentStyleDirection ] }
				{ ...iconProps }
			/>
		),
		showTooltip: true,
	},
	{
		value: 'stretch',
		label: __( 'Stretch', 'elementor' ),
		renderContent: ( { size }: { size: ToggleButtonProps[ 'size' ] } ) => (
			<RotatedIcon
				icon={ JustifyIcon }
				size={ size }
				offset={ ALIGN_SELF_CHILD_OFFSET_MAP[ parentStyleDirection ] }
				{ ...iconProps }
			/>
		),
		showTooltip: true,
	},
];

export const AlignSelfChild = ( { parentStyleDirection }: { parentStyleDirection: FlexDirection } ) => (
	<StylesField bind="align-self" propDisplayName={ ALIGN_SELF_LABEL }>
		<UiProviders>
			<StylesFieldLayout label={ ALIGN_SELF_LABEL }>
				<ToggleControl options={ getOptions( parentStyleDirection ) } />
			</StylesFieldLayout>
		</UiProviders>
	</StylesField>
);
