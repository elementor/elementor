import { type InteractionsConfig } from '../types';

const DEFAULT_CONFIG: InteractionsConfig = {
	constants: {
		defaultDuration: 600,
		defaultDelay: 0,
		slideDistance: 100,
		scaleStart: 0,
		defaultEasing: 'easeIn',
		relativeTo: 'viewport',
		end: 15,
		start: 85,
	},
};

export function getInteractionsConfig(): InteractionsConfig {
	return window.ElementorInteractionsConfig || DEFAULT_CONFIG;
}
