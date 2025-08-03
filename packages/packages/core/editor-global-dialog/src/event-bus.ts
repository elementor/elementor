type Callback< T = any > = ( payload: T ) => void;

const subscribers = new Map< string, Set< Callback > >();

export const subscribe = < T = any >( event: string, cb: Callback< T > ) => {
	if ( ! subscribers.has( event ) ) {
		subscribers.set( event, new Set() );
	}
	subscribers.get( event )?.add( cb );
	return () => subscribers.get( event )?.delete( cb );
};

export const publish = < T = any >( event: string, payload: T ) => {
	subscribers.get( event )?.forEach( ( cb ) => cb( payload ) );
};
