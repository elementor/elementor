class RepeaterEventBus {
	private listeners = new Map< string, Set< ( data?: { itemValue: unknown } ) => void > >();

	subscribe( eventName: string, callback: ( data?: { itemValue: unknown } ) => void ) {
		if ( ! this.listeners.has( eventName ) ) {
			this.listeners.set( eventName, new Set() );
		}
		const eventListeners = this.listeners.get( eventName );
		if ( eventListeners ) {
			eventListeners.add( callback );
		}
	}

	unsubscribe( eventName: string, callback?: ( data?: { itemValue: unknown } ) => void ) {
		const eventListeners = this.listeners.get( eventName );
		if ( ! eventListeners ) {
			return;
		}

		if ( callback ) {
			eventListeners.delete( callback );
			if ( eventListeners.size === 0 ) {
				this.listeners.delete( eventName );
			}
		} else {
			this.listeners.delete( eventName );
		}
	}

	emit( eventName: string, data?: { itemValue: unknown } ) {
		const eventListeners = this.listeners.get( eventName );
		if ( eventListeners ) {
			eventListeners.forEach( ( callback ) => callback( data ) );
		}
	}

	clearAll(): void {
		this.listeners.clear();
	}
}

export const repeaterEventBus = new RepeaterEventBus();
