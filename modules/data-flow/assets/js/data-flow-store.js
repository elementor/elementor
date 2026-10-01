export const ANY_KEY = '*';

function toPartialState( keyOrPartial, value, state ) {
	if ( 'object' === typeof keyOrPartial && null !== keyOrPartial ) {
		return keyOrPartial;
	}

	const nextValue = 'function' === typeof value ? value( state[ keyOrPartial ] ) : value;

	return { [ keyOrPartial ]: nextValue };
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

	return { getState, setState, subscribe };
}
