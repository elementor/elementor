import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleControl } from '@elementor/editor-controls';
import {
	JustifyBottomIcon,
	JustifyCenterIcon as CenterIcon,
	JustifyDistributeVerticalIcon as EvenlyIcon,
	JustifySpaceAroundVerticalIcon as AroundIcon,
	JustifySpaceBetweenVerticalIcon as BetweenIcon,
	JustifyTopIcon,
} from '@elementor/icons';
import { withDirection } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { StylesFieldLayout } from '../../styles-field-layout';
import { RotatedIcon } from './utils/rotated-icon';

type AlignContent = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';

const ALIGN_CONTENT_LABEL = __( 'Align content', 'elementor' );

const StartIcon = withDirection( JustifyTopIcon );
const EndIcon = withDirection( JustifyBottomIcon );

const iconProps = {
	isClockwise: false,
	offset: 0,
	disableRotationForReversed: true,
};

const options: ToggleButtonGroupItem< AlignContent >[] = [
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
		value: 'space-between',
		label: __( 'Space between', 'elementor' ),
		renderContent: ( { size } ) => <RotatedIcon icon={ BetweenIcon } size={ size } { ...iconProps } />,
		showTooltip: true,
	},
	{
		value: 'space-around',
		label: __( 'Space around', 'elementor' ),
		renderContent: ( { size } ) => <RotatedIcon icon={ AroundIcon } size={ size } { ...iconProps } />,
		showTooltip: true,
	},
	{
		value: 'space-evenly',
		label: __( 'Space evenly', 'elementor' ),
		renderContent: ( { size } ) => <RotatedIcon icon={ EvenlyIcon } size={ size } { ...iconProps } />,
		showTooltip: true,
	},
];

export const AlignContentField = () => (
	<StylesField bind="align-content" propDisplayName={ ALIGN_CONTENT_LABEL }>
		<UiProviders>
			<StylesFieldLayout label={ ALIGN_CONTENT_LABEL } direction="column">
				<ToggleControl options={ options } fullWidth={ true } />
			</StylesFieldLayout>
		</UiProviders>
	</StylesField>
);
