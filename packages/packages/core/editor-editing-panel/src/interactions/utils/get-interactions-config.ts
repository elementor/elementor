import { type ExtendedWindow } from '../../sync/types';
import { type InteractionsConfig } from '../types';

const DEFAULT_CONFIG: InteractionsConfig = {
	constants: {
		defaultDuration: 300,
		defaultDelay: 0,
		slideDistance: 100,
		scaleStart: 0.5,
		easing: 'linear',
	},
	animationOptions: [],
};

export function getInteractionsConfig(): InteractionsConfig {
	const extendedWindow = window as unknown as ExtendedWindow;
	return extendedWindow.ElementorInteractionsConfig || DEFAULT_CONFIG;
}
