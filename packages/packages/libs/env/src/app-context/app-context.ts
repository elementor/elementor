type Key = string | symbol;
type Resolver< T > = ( value: T ) => void;
const _resolvers: Map< Key, Resolver< unknown > > = new Map();
const _providers: Map< Key, Promise< unknown > > = new Map();

function getResolution< T >( key: Key ): Promise< T > {
	if ( ! _providers.has( key ) ) {
		_providers.set( key, new Promise( ( resolve ) => _resolvers.set( key, resolve ) ) );
	}
	return _providers.get( key ) as Promise< T >;
}

export const AppContext = {
	require< T >( key: Key ) {
		return getResolution( key ) as Promise< T >;
	},

	provide( key: Key, value: unknown ) {
		void getResolution( key );
		const resolver = _resolvers.get( key );
		if ( resolver ) {
			resolver( value );
		}
	},
};
