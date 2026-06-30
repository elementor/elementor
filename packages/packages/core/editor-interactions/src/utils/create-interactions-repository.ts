import { type InteractionsProvider } from '../types';

export const createInteractionsRepository = () => {
	const providers: InteractionsProvider[] = [];

	const getProviders = () => {
		const sorted = providers.slice( 0 ).sort( ( a, b ) => ( a.priority > b.priority ? -1 : 1 ) );
		return sorted;
	};

	const register = ( provider: InteractionsProvider ) => {
		providers.push( provider );
	};

	const all = () => {
		return getProviders().flatMap( ( provider ) => provider.actions.all() );
	};

	const subscribe = ( cb: () => void ) => {
		const unsubscribes = providers.map( ( provider ) => provider.subscribe( cb ) );

		return () => {
			unsubscribes.forEach( ( unsubscribe ) => unsubscribe() );
		};
	};

	const getProviderByKey = ( key: string ) => {
		return providers.find( ( provider ) => {
			try {
				return provider.getKey() === key;
			} catch {
				// Provider might not be ready yet (e.g., no document loaded)
				return false;
			}
		} );
	};

	return {
		all,
		register,
		subscribe,
		getProviders,
		getProviderByKey,
	};
};
