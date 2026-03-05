class EventBus {
	private listeners = new Map< string, Set< ( data?: unknown ) => void > >();

	subscribe( eventName: string, callback: ( data?: unknown ) => void ) {
		if ( ! this.listeners.has( eventName ) ) {
			this.listeners.set( eventName, new Set() );
		}
		const eventListeners = this.listeners.get( eventName );
		if ( eventListeners ) {
			eventListeners.add( callback );
		}
	}

	unsubscribe( eventName: string, callback: ( data?: unknown ) => void ) {
		const eventListeners = this.listeners.get( eventName );
		if ( ! eventListeners ) {
			return;
		}

		eventListeners.delete( callback );
		if ( eventListeners.size === 0 ) {
			this.listeners.delete( eventName );
		}
	}

	emit( eventName: string, data?: unknown ) {
		const eventListeners = this.listeners.get( eventName );
		if ( eventListeners ) {
			eventListeners.forEach( ( callback ) => callback( data ) );
		}
	}

	clearAll(): void {
		this.listeners.clear();
	}
}

export const eventBus = new EventBus();
