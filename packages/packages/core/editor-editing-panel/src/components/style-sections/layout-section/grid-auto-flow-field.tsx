import * as React from 'react';
import { ControlToggleButtonGroup, type ToggleButtonGroupItem } from '@elementor/editor-controls';
import { type StringPropValue } from '@elementor/editor-props';
import { ArrowDownSmallIcon, ArrowRightIcon, LayoutDashboardIcon } from '@elementor/icons';
import { Grid, ToggleButton, Tooltip, withDirection } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { useStylesField } from '../../../hooks/use-styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { StylesFieldLayout } from '../../styles-field-layout';

type AutoFlowDirection = 'row' | 'column';

const AUTO_FLOW_LABEL = __( 'Auto flow', 'elementor' );
const DENSE_LABEL = __( 'Dense', 'elementor' );

const StartIcon = withDirection( ArrowRightIcon );

const directionOptions: ToggleButtonGroupItem< AutoFlowDirection >[] = [
	{
		value: 'row',
		label: __( 'Row', 'elementor' ),
		renderContent: ( { size } ) => <StartIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'column',
		label: __( 'Column', 'elementor' ),
		renderContent: ( { size } ) => <ArrowDownSmallIcon fontSize={ size } />,
		showTooltip: true,
	},
];

const parseAutoFlow = ( value: string | null ): { direction: AutoFlowDirection; dense: boolean } => {
	if ( ! value ) {
		return { direction: 'row', dense: false };
	}
	const dense = value.includes( 'dense' );
	const direction = value.replace( /\s*dense\s*/, '' ).trim() as AutoFlowDirection;
	return { direction: direction || 'row', dense };
};

const composeAutoFlow = ( direction: AutoFlowDirection, dense: boolean ): string => {
	return dense ? `${ direction } dense` : direction;
};

const GridAutoFlowFieldContent = () => {
	const { value, setValue } = useStylesField< StringPropValue | null >( 'grid-auto-flow', {
		history: { propDisplayName: AUTO_FLOW_LABEL },
	} );

	const { direction, dense } = parseAutoFlow( value?.value ?? null );

	const handleDirectionChange = ( newDirection: AutoFlowDirection | null ) => {
		if ( ! newDirection ) {
			return;
		}
		setValue( { $$type: 'string', value: composeAutoFlow( newDirection, dense ) } );
	};

	const handleDenseToggle = () => {
		setValue( { $$type: 'string', value: composeAutoFlow( direction, ! dense ) } );
	};

	return (
		<StylesFieldLayout label={ AUTO_FLOW_LABEL }>
			<Grid container gap={ 1 } flexWrap="nowrap" alignItems="center" justifyContent="flex-end">
				<Grid item sx={ { width: 64, maxWidth: '100%' } }>
					<ControlToggleButtonGroup
						items={ directionOptions }
						value={ direction }
						onChange={ handleDirectionChange }
						exclusive={ true }
						fullWidth={ true }
					/>
				</Grid>
				<Grid item>
					<Tooltip title={ DENSE_LABEL }>
						<ToggleButton
							value="dense"
							selected={ dense }
							onChange={ handleDenseToggle }
							size="tiny"
							aria-label={ DENSE_LABEL }
						>
							<LayoutDashboardIcon fontSize="tiny" />
						</ToggleButton>
					</Tooltip>
				</Grid>
			</Grid>
		</StylesFieldLayout>
	);
};

export const GridAutoFlowField = () => (
	<StylesField bind="grid-auto-flow" propDisplayName={ AUTO_FLOW_LABEL }>
		<UiProviders>
			<GridAutoFlowFieldContent />
		</UiProviders>
	</StylesField>
);
