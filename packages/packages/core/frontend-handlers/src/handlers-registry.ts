type Handler = ( params: { element: Element; signal: AbortSignal } ) => ( () => void ) | undefined;

export const handlers: Map< string, Map< string, Handler > > = new Map();

export const register = ( { elementType, id, callback }: { elementType: string; id: string; callback: Handler } ) => {
	if ( ! handlers.has( elementType ) ) {
		handlers.set( elementType, new Map() );
	}

	if ( ! handlers.get( elementType )?.has( id ) ) {
		handlers.get( elementType )?.set( id, callback );
	}
};

export const unregister = ( { elementType, id }: { elementType: string; id?: string } ) => {
	if ( ! handlers.has( elementType ) ) {
		return;
	}

	if ( id ) {
		handlers.get( elementType )?.delete( id );

		if ( handlers.get( elementType )?.size === 0 ) {
			handlers.delete( elementType );
		}
	} else {
		handlers.delete( elementType );
	}
};
