import { type Meta, type StylesCollection, type StylesProvider } from '../types';

export const createStylesRepository = () => {
	const providers: StylesProvider[] = [];
	const subscribers: Array< ( previous?: StylesCollection, current?: StylesCollection ) => void > = [];
	const unsubscribes: Array< () => void > = [];

	const getProviders = () => {
		return providers.slice( 0 ).sort( ( a, b ) => ( a.priority > b.priority ? -1 : 1 ) );
	};

	const register = ( provider: StylesProvider ) => {
		providers.push( provider );

		subscribers.forEach( ( subscriber ) => {
			unsubscribes.push( provider.subscribe( subscriber ) );
		} );
	};

	const all = ( meta: Meta = {} ) => {
		return getProviders().flatMap( ( provider ) => provider.actions.all( meta ) );
	};

	const subscribe = ( cb: ( previous?: StylesCollection, current?: StylesCollection ) => void ) => {
		subscribers.push( cb );

		providers.forEach( ( provider ) => {
			unsubscribes.push( provider.subscribe( cb ) );
		} );

		return () => {
			unsubscribes.forEach( ( unsubscribe ) => unsubscribe() );
		};
	};

	const getProviderByKey = ( key: string ) => {
		return providers.find( ( provider ) => provider.getKey() === key );
	};

	return {
		all,
		register,
		subscribe,
		getProviders,
		getProviderByKey,
	};
};
