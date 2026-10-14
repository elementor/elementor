const batchers = new WeakMap();

export function getWriteBatcher( store, schedule = ( callback ) => requestAnimationFrame( callback ) ) {
	if ( batchers.has( store ) ) {
		return batchers.get( store );
	}

	let pending = {};
	let isScheduled = false;

	const flush = () => {
		const partial = pending;

		pending = {};
		isScheduled = false;
		store.setState( partial );
	};

	const batcher = {
		read: ( key ) => ( key in pending ? pending[ key ] : store.getState()[ key ] ),
		keys: () => Object.keys( { ...store.getState(), ...pending } ),
		write: ( key, value ) => {
			pending[ key ] = value;

			if ( ! isScheduled ) {
				isScheduled = true;
				schedule( flush );
			}
		},
	};

	batchers.set( store, batcher );

	return batcher;
}

export function createStateProxy( batcher ) {
	return new Proxy( {}, {
		get: ( target, key ) => ( 'string' === typeof key ? batcher.read( key ) : undefined ),
		set: ( target, key, value ) => {
			batcher.write( key, value );

			return true;
		},
		has: ( target, key ) => batcher.keys().includes( key ),
		ownKeys: () => batcher.keys(),
		getOwnPropertyDescriptor: ( target, key ) => ( {
			value: batcher.read( key ),
			enumerable: true,
			configurable: true,
			writable: true,
		} ),
	} );
}
