type Callback< T = any > = ( payload: T ) => void;

const subscribers = new Map< string, Set< Callback > >();

export const subscribe = < T = unknown >( event: string, cb: Callback< T > ) => {
	if ( ! subscribers.has( event ) ) {
		subscribers.set( event, new Set() );
	}
	subscribers.get( event )?.add( cb );
	return () => subscribers.get( event )?.delete( cb );
};

export const publish = < T = unknown >( event: string, payload: T ) => {
	subscribers.get( event )?.forEach( ( cb ) => cb( payload ) );
};
