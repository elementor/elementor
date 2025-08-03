import * as React from 'react';
import { selectionSizePropTypeUtil } from '@elementor/editor-props';

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

const SELECTION_SIZE_PROPS = {
	selectionLabel: 'Type',
	sizeLabel: 'Duration',
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

const CHILD_CONTROL_CONFIG = {
	propTypeUtil: selectionSizePropTypeUtil,
	component: SelectionSizeControl as unknown as React.ComponentType< Record< string, unknown > >,
	props: SELECTION_SIZE_PROPS,
};

export const TransitionRepeaterControl = createControl( () => {
	return (
		<RepeatableControl
			label="Transitions"
			repeaterLabel="Transitions"
			patternLabel="${value.selection.value.key.value}: ${value.size.value.size}${value.size.value.unit}"
			placeholder="Empty Transition"
			showDuplicate={ false }
			showToggle={ true }
			initialValues={ initialTransitionValue }
			childControlConfig={ CHILD_CONTROL_CONFIG }
			propKey="transition"
		/>
	);
} );
