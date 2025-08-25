export const RepeaterEvents = {
	TransitionItemAdded: 'transition-item-added',
	TransitionItemRemoved: 'transition-item-removed',
} as const;

export type RepeaterEventType = ( typeof RepeaterEvents )[ keyof typeof RepeaterEvents ];

export class RepeaterEventBus {
	private listeners = new Map< RepeaterEventType, ( data?: { itemValue: unknown } ) => void >();

	subscribe( eventName: RepeaterEventType, callback: ( data?: { itemValue: unknown } ) => void ) {
		if ( ! this.listeners.has( eventName ) ) {
			this.listeners.set( eventName, callback );
		}
	}

	unsubscribe( eventName: RepeaterEventType ) {
		this.listeners.delete( eventName );
	}

	emit( eventName: RepeaterEventType, data?: { itemValue: unknown } ) {
		this.listeners.get( eventName )?.( data );
	}
}

export const repeaterEventBus = new RepeaterEventBus();
