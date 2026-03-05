import { type InteractionsConfig } from '../types';

export function getInteractionsConfig(): InteractionsConfig {
	return window.ElementorInteractionsConfig ?? ( {} as InteractionsConfig );
}
