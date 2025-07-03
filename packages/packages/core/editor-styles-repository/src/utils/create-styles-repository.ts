import { type Meta, type StylesProvider } from '../types';

export const createStylesRepository = () => {
	const providers: StylesProvider[] = [];

	const getProviders = () => {
		return providers.slice( 0 ).sort( ( a, b ) => ( a.priority > b.priority ? -1 : 1 ) );
	};

	const register = ( provider: StylesProvider ) => {
		providers.push( provider );
	};

	const all = ( meta: Meta = {} ) => {
		return getProviders().flatMap( ( provider ) => provider.actions.all( meta ) );
	};

	const subscribe = ( cb: () => void ) => {
		const unsubscribes = providers.map( ( provider ) => {
			return provider.subscribe( cb );
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
