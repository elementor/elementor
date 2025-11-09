import { type InteractionsProvider } from '../types';

export const createInteractionsRepository = () => {
	const providers: InteractionsProvider[] = [];

	const getProviders = () => {
		console.log( '[Interactions Repository] getProviders() called, providers count:', providers.length );
		const sorted = providers.slice( 0 ).sort( ( a, b ) => ( a.priority > b.priority ? -1 : 1 ) );
		console.log( '[Interactions Repository] Returning sorted providers:', sorted.length );
		return sorted;
	};

	const register = ( provider: InteractionsProvider ) => {
		console.log( '[Interactions Repository] register() called' );
		// NOTE: We do NOT call getKey() here - it should only be called when needed (in subscribers)
		providers.push( provider );
		console.log( '[Interactions Repository] Provider registered, total providers:', providers.length );
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

