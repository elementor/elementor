import * as React from 'react';
import { useMemo } from 'react';
import { type ToggleButtonGroupItem, ToggleControl } from '@elementor/editor-controls';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { ATOMIC_GRID_CONTROL_EXPERIMENT } from '../../../experiments';
import { useStylesInheritanceChain } from '../../../contexts/styles-inheritance-context';
import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

type Displays =
	| 'block'
	| 'flex'
	| 'grid'
	| 'inline-grid'
	| 'inline-block'
	| 'inline-flex'
	| 'none';

const DISPLAY_LABEL = __( 'Display', 'elementor' );

function buildDisplayFieldItems( includeGridDisplayModes: boolean ): ToggleButtonGroupItem< Displays >[] {
	const gridItems: ToggleButtonGroupItem< Displays >[] = includeGridDisplayModes
		? [
				{
					value: 'grid',
					renderContent: () => __( 'Grid', 'elementor' ),
					label: __( 'Grid', 'elementor' ),
					showTooltip: true,
				},
				{
					value: 'inline-grid',
					renderContent: () => __( 'In-grid', 'elementor' ),
					label: __( 'Inline grid', 'elementor' ),
					showTooltip: true,
				},
		  ]
		: [];

	return [
		{
			value: 'block',
			renderContent: () => __( 'Block', 'elementor' ),
			label: __( 'Block', 'elementor' ),
			showTooltip: true,
		},
		{
			value: 'flex',
			renderContent: () => __( 'Flex', 'elementor' ),
			label: __( 'Flex', 'elementor' ),
			showTooltip: true,
		},
		...gridItems,
		{
			value: 'inline-block',
			renderContent: () => __( 'In-blk', 'elementor' ),
			label: __( 'Inline-block', 'elementor' ),
			showTooltip: true,
		},
		{
			value: 'none',
			renderContent: () => __( 'None', 'elementor' ),
			label: __( 'None', 'elementor' ),
			showTooltip: true,
		},
		{
			value: 'inline-flex',
			renderContent: () => __( 'In-flx', 'elementor' ),
			label: __( 'Inline-flex', 'elementor' ),
			showTooltip: true,
		},
	];
}

export const DisplayField = () => {
	const placeholder = useDisplayPlaceholderValue();
	const includeGrid = isExperimentActive( ATOMIC_GRID_CONTROL_EXPERIMENT );
	const displayFieldItems = useMemo( () => buildDisplayFieldItems( includeGrid ), [ includeGrid ] );

	return (
		<StylesField bind="display" propDisplayName={ DISPLAY_LABEL } placeholder={ placeholder }>
			<StylesFieldLayout label={ DISPLAY_LABEL } direction="column">
				<ToggleControl options={ displayFieldItems } maxItems={ 4 } fullWidth={ true } />
			</StylesFieldLayout>
		</StylesField>
	);
};

// TODO - placing this logic deliberately here, and will be removed once applied automatically to all style fields as part of ED-18491
export const useDisplayPlaceholderValue = () => useStylesInheritanceChain( [ 'display' ] )[ 0 ]?.value ?? undefined;
