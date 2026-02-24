import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { EASING_OPTIONS } from '../../components/controls/easing';
import { TRIGGER_OPTIONS, BASE_TRIGGERS } from '../../components/controls/trigger';
import { MAX_INTERACTIONS_PER_ELEMENT } from '../constants';

export const INTERACTIONS_SCHEMA_URI = 'elementor://interactions/schema';

const schema = {
	triggers: BASE_TRIGGERS.map( ( key ) => ( {
		value: key,
		label: TRIGGER_OPTIONS[ key as keyof typeof TRIGGER_OPTIONS ] ?? key,
	} ) ),
	effects: [
		{ value: 'fade', label: 'Fade' },
		{ value: 'slide', label: 'Slide' },
		{ value: 'scale', label: 'Scale' },
	],
	effectTypes: [
		{ value: 'in', label: 'In' },
		{ value: 'out', label: 'Out' },
	],
	directions: [
		{ value: 'top', label: 'Top', note: '' },
		{ value: 'bottom', label: 'Bottom', note: '' },
		{ value: 'left', label: 'Left', note: '' },
		{ value: 'right', label: 'Right', note: '' },
		{ value: '', label: 'None', note: 'Slide animation must have a direction' },
	],
	easings: Object.entries( EASING_OPTIONS ).map( ( [ value, label ] ) => ( { value, label } ) ),
	timing: {
		duration: { min: 0, max: 10000, unit: 'ms', description: 'Animation duration in milliseconds' },
		delay: { min: 0, max: 10000, unit: 'ms', description: 'Animation delay in milliseconds' },
	},
	excludedBreakpoints: {
		type: 'string[]',
		description: 'List of breakpoint IDs on which this interaction is disabled. Omit to enable on all breakpoints.',
	},
	maxInteractionsPerElement: MAX_INTERACTIONS_PER_ELEMENT,
};

export const initInteractionsSchemaResource = ( reg: MCPRegistryEntry ) => {
	const { resource } = reg;

	resource(
		'interactions-schema',
		INTERACTIONS_SCHEMA_URI,
		{
			description: 'Schema describing all available options for element interactions (triggers, effects, easings, timing, breakpoints, etc.).',
		},
		async () => {
			return {
				contents: [
					{
						uri: INTERACTIONS_SCHEMA_URI,
						text: JSON.stringify( schema, null, 2 ),
					},
				],
			};
		}
	);
};
