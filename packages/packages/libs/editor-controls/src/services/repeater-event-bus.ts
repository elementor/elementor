export const RepeaterEvents = {
	TransitionItemAdded: 'transition-item-added',
	TransitionItemRemoved: 'transition-item-removed',
} as const;

export type RepeaterEventType = ( typeof RepeaterEvents )[ keyof typeof RepeaterEvents ];

export class RepeaterEventBus {
	private listeners = new Map< string, Set< ( data?: unknown ) => void > >();

	subscribe( eventName: RepeaterEventType, callback: ( data?: unknown ) => void ) {
		if ( ! this.listeners.has( eventName ) ) {
			this.listeners.set( eventName, new Set() );
		}
		this.listeners.get( eventName )?.add( callback );

		return () => {
			this.unsubscribe( eventName, callback );
		};
	}

	unsubscribe( eventName: RepeaterEventType, callback: ( data?: unknown ) => void ) {
		this.listeners.get( eventName )?.delete( callback );
	}

	emit( eventName: RepeaterEventType, data?: unknown ) {
		this.listeners.get( eventName )?.forEach( ( callback ) => callback( data ) );
	}
}

export const repeaterEventBus = new RepeaterEventBus();
