import { type InteractionsConfig } from '../types';

const DEFAULT_CONFIG: InteractionsConfig = {
	constants: {
		defaultDuration: 300,
		defaultDelay: 0,
		slideDistance: 100,
		scaleStart: 0.5,
		easing: 'linear',
	},
};

export function getInteractionsConfig(): InteractionsConfig {
	return window.ElementorInteractionsConfig || DEFAULT_CONFIG;
}
