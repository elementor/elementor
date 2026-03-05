import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleControl } from '@elementor/editor-controls';
import { ArrowDownSmallIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpSmallIcon } from '@elementor/icons';
import { withDirection } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { StylesFieldLayout } from '../../styles-field-layout';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

const FLEX_DIRECTION_LABEL = __( 'Direction', 'elementor' );

const options: ToggleButtonGroupItem< FlexDirection >[] = [
	{
		value: 'row',
		label: __( 'Row', 'elementor' ),
		renderContent: ( { size } ) => {
			const StartIcon = withDirection( ArrowRightIcon );
			return <StartIcon fontSize={ size } />;
		},
		showTooltip: true,
	},
	{
		value: 'column',
		label: __( 'Column', 'elementor' ),
		renderContent: ( { size } ) => <ArrowDownSmallIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'row-reverse',
		label: __( 'Reversed row', 'elementor' ),
		renderContent: ( { size } ) => {
			const EndIcon = withDirection( ArrowLeftIcon );
			return <EndIcon fontSize={ size } />;
		},
		showTooltip: true,
	},
	{
		value: 'column-reverse',
		label: __( 'Reversed column', 'elementor' ),
		renderContent: ( { size } ) => <ArrowUpSmallIcon fontSize={ size } />,
		showTooltip: true,
	},
];

export const FlexDirectionField = () => {
	return (
		<StylesField bind="flex-direction" propDisplayName={ FLEX_DIRECTION_LABEL }>
			<UiProviders>
				<StylesFieldLayout label={ FLEX_DIRECTION_LABEL }>
					<ToggleControl options={ options } />
				</StylesFieldLayout>
			</UiProviders>
		</StylesField>
	);
};
