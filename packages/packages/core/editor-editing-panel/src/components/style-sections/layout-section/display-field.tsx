import * as React from 'react';
import { type ToggleButtonGroupItem, ToggleControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { useStylesInheritanceChain } from '../../../contexts/styles-inheritance-context';
import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

type Displays = 'block' | 'flex' | 'inline-block' | 'inline-flex' | 'none';

const DISPLAY_LABEL = __( 'Display', 'elementor' );

const displayFieldItems: ToggleButtonGroupItem< Displays >[] = [
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

export const DisplayField = () => {
	const placeholder = useDisplayPlaceholderValue();

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
