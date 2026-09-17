import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleControl } from '@elementor/editor-controls';
import {
	JustifyBottomIcon,
	JustifyCenterIcon,
	JustifyTopIcon,
	LayoutDistributeVerticalIcon as JustifyIcon,
} from '@elementor/icons';
import { type ToggleButtonProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { StylesFieldLayout } from '../../styles-field-layout';

type AlignSelf = 'start' | 'center' | 'end' | 'stretch';

const ALIGN_SELF_LABEL = __( 'Align self', 'elementor' );

const ALIGN_SELF_CHILD_OFFSET_MAP: Record< string, number > = {
	row: 0,
	column: -90,
};

export const AlignSelfGridChild = ( { parentStyleDirection }: { parentStyleDirection: string } ) => (
	<StylesField bind="align-self" propDisplayName={ ALIGN_SELF_LABEL }>
		<UiProviders>
			<StylesFieldLayout label={ ALIGN_SELF_LABEL }>
				<ToggleControl options={ getOptions( parentStyleDirection ?? 'row' ) } />
			</StylesFieldLayout>
		</UiProviders>
	</StylesField>
);

const RotatedIcon = ( {
	icon: Icon,
	size,
	offset,
}: {
	icon: React.JSX.ElementType;
	size: ToggleButtonProps[ 'size' ];
	offset?: number;
} ) => <Icon fontSize={ size } sx={ { rotate: `${ offset }deg` } } />;

const getOptions = ( parentStyleDirection: string ): ToggleButtonGroupItem< AlignSelf >[] => {
	const offset = ALIGN_SELF_CHILD_OFFSET_MAP[ parentStyleDirection.replace( 'dense', '' ).trim() ];

	return [
		{
			value: 'start',
			label: __( 'Start', 'elementor' ),
			renderContent: ( { size } ) => <RotatedIcon icon={ JustifyTopIcon } size={ size } offset={ offset } />,
			showTooltip: true,
		},
		{
			value: 'center',
			label: __( 'Center', 'elementor' ),
			renderContent: ( { size } ) => <RotatedIcon icon={ JustifyCenterIcon } size={ size } offset={ offset } />,
			showTooltip: true,
		},
		{
			value: 'end',
			label: __( 'End', 'elementor' ),
			renderContent: ( { size } ) => <RotatedIcon icon={ JustifyBottomIcon } size={ size } offset={ offset } />,
			showTooltip: true,
		},
		{
			value: 'stretch',
			label: __( 'Stretch', 'elementor' ),
			renderContent: ( { size } ) => <RotatedIcon icon={ JustifyIcon } size={ size } offset={ offset } />,
			showTooltip: true,
		},
	];
};
