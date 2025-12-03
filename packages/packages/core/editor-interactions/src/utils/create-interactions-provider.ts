import { type InteractionsProvider } from '../types';

export type CreateInteractionsProviderOptions = {
	key: string | ( () => string );
	priority?: number;
	subscribe?: ( callback: () => void ) => () => void;
	actions: {
		all: InteractionsProvider[ 'actions' ][ 'all' ];
	};
};

const DEFAULT_PRIORITY = 10;

export function createInteractionsProvider( {
	key,
	priority = DEFAULT_PRIORITY,
	subscribe = () => () => {},
	actions,
}: CreateInteractionsProviderOptions ): InteractionsProvider {
	return {
		getKey: typeof key === 'string' ? () => key : key,
		priority,
		subscribe,
		actions: {
			all: actions.all,
		},
	};
}
