import * as React from 'react';
import { selectionSizePropTypeUtil } from '@elementor/editor-props';

import { createControl } from '../create-control';
import { RepeatableControl } from './repeatable-control';
import { SelectControl } from './select-control';
import { SelectionSizeControl } from './selection-size-control';

const TRANSITION_PROPERTIES = [ { label: 'Filter', value: 'filter' } ];

const DURATION_CONFIG = {
	variant: 'time',
	units: [ 's', 'ms' ],
	defaultUnit: 's',
};

const INITIAL_VALUES = {
	selection: { $$type: 'string', value: 'filter' },
	size: { $$type: 'size', value: { size: 0, unit: 's' } },
};

const SELECTION_SIZE_PROPS = {
	selectionLabel: 'Property',
	sizeLabel: 'Duration',
	selectionConfig: {
		component: SelectControl,
		props: {
			options: TRANSITION_PROPERTIES,
		},
	},
	sizeConfigMap: {
		filter: DURATION_CONFIG,
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
			repeaterLabel="Add Transition"
			patternLabel="${value.selection.value} (${value.size.value.size}${value.size.value.unit})"
			placeholder="Empty Transition"
			showDuplicate={ true }
			showToggle={ true }
			initialValues={ INITIAL_VALUES }
			childControlConfig={ CHILD_CONTROL_CONFIG }
			propKey="transition"
		/>
	);
} );
