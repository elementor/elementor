export class RepeaterEventBus {
	private listeners = new Map< string, ( data?: { itemValue: unknown } ) => void >();

	subscribe( eventName: string, callback: ( data?: { itemValue: unknown } ) => void ) {
		if ( ! this.listeners.has( eventName ) ) {
			this.listeners.set( eventName, callback );
		}
	}

	unsubscribe( eventName: string ) {
		this.listeners.delete( eventName );
	}

	emit( eventName: string, data?: { itemValue: unknown } ) {
		this.listeners.get( eventName )?.( data );
	}
}

export const repeaterEventBus = new RepeaterEventBus();
