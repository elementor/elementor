export const ANY_KEY = '*';

function toPartialState( keyOrPartial, value, state ) {
	if ( 'object' === typeof keyOrPartial && null !== keyOrPartial ) {
		return keyOrPartial;
	}

	const nextValue = 'function' === typeof value ? value( state[ keyOrPartial ] ) : value;

	return { [ keyOrPartial ]: nextValue };
}

export function toStoreResolver( storeOrResolver ) {
	return 'function' === typeof storeOrResolver ? storeOrResolver : () => storeOrResolver;
}

export function createStore( initialState = {} ) {
	let state = { ...initialState };
	const listeners = new Map();

	const getState = () => state;

	const notify = ( key ) => {
		[ key, ANY_KEY ].forEach( ( listenerKey ) => {
			listeners.get( listenerKey )?.forEach( ( listener ) => listener( state[ key ], key, state ) );
		} );
	};

	const setState = ( keyOrPartial, value ) => {
		const partial = toPartialState( keyOrPartial, value, state );
		const changedKeys = Object.keys( partial ).filter( ( key ) => ! Object.is( state[ key ], partial[ key ] ) );

		if ( ! changedKeys.length ) {
			return;
		}

		state = { ...state, ...partial };
		changedKeys.forEach( notify );
	};

	const subscribe = ( key, listener ) => {
		if ( ! listeners.has( key ) ) {
			listeners.set( key, new Set() );
		}

		listeners.get( key ).add( listener );

		return () => listeners.get( key ).delete( listener );
	};

	const provides = ( key ) => Object.prototype.hasOwnProperty.call( state, key );

	return { getState, setState, subscribe, provides, owns: provides };
}

export function createScopedStore( initialState = {}, parentStore ) {
	const ownStore = createStore( initialState );

	const getState = () => ( { ...parentStore.getState(), ...ownStore.getState() } );

	const provides = ( key ) => ownStore.provides( key ) || parentStore.provides( key );

	const getOwnerStore = ( key ) => {
		if ( ownStore.provides( key ) || ! parentStore.provides( key ) ) {
			return ownStore;
		}

		return parentStore;
	};

	const setState = ( keyOrPartial, value ) => {
		const partial = toPartialState( keyOrPartial, value, getState() );

		Object.entries( partial ).forEach( ( [ key, nextValue ] ) => {
			getOwnerStore( key ).setState( key, nextValue );
		} );
	};

	const subscribe = ( key, listener ) => {
		const notify = ( changedValue, changedKey ) => listener( changedValue, changedKey, getState() );

		const unsubscribeOwn = ownStore.subscribe( key, notify );
		const unsubscribeParent = parentStore.subscribe( key, ( changedValue, changedKey ) => {
			if ( ! ownStore.provides( changedKey ) ) {
				notify( changedValue, changedKey );
			}
		} );

		return () => {
			unsubscribeOwn();
			unsubscribeParent();
		};
	};

	return { getState, setState, subscribe, provides, owns: ownStore.provides };
}
