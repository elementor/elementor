import * as React from 'react';
import { selectionSizePropTypeUtil } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

import { createControl } from '../../create-control';
import { RepeatableControl } from '../repeatable-control';
import { SelectionSizeControl } from '../selection-size-control';
import { initialTransitionValue, transitionProperties } from './data';
import { TransitionSelector } from './transition-selector';

const DURATION_CONFIG = {
	variant: 'time',
	units: [ 's', 'ms' ],
	defaultUnit: 'ms',
};

// this config needs to be loaded at runtime/render since it's the transitionProperties object will be mutated by the pro plugin.
// See: https://elementor.atlassian.net/browse/ED-20285
const getSelectionSizeProps = () => {
	return {
		selectionLabel: __( 'Type', 'elementor' ),
		sizeLabel: __( 'Duration', 'elementor' ),
		selectionConfig: {
			component: TransitionSelector,
			props: {},
		},
		sizeConfigMap: {
			...transitionProperties.reduce(
				( acc, category ) => {
					category.properties.forEach( ( property ) => {
						acc[ property.value ] = DURATION_CONFIG;
					} );
					return acc;
				},
				{} as Record< string, typeof DURATION_CONFIG >
			),
		},
	};
};

function getChildControlConfig() {
	return {
		propTypeUtil: selectionSizePropTypeUtil,
		component: SelectionSizeControl as unknown as React.ComponentType< Record< string, unknown > >,
		props: getSelectionSizeProps(),
	};
}

export const TransitionRepeaterControl = createControl( () => {
	return (
		<RepeatableControl
			label={ __( 'Transitions', 'elementor' ) }
			repeaterLabel={ __( 'Transitions', 'elementor' ) }
			patternLabel="${value.selection.value.key.value}: ${value.size.value.size}${value.size.value.unit}"
			placeholder={ __( 'Empty Transition', 'elementor' ) }
			showDuplicate={ false }
			showToggle={ true }
			initialValues={ initialTransitionValue }
			childControlConfig={ getChildControlConfig() }
			propKey="transition"
		/>
	);
} );
