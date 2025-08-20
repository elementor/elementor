export const RepeaterEvents = {
	TransitionItemAdded: 'transition-item-added',
} as const;

export type RepeaterEventType = ( typeof RepeaterEvents )[ keyof typeof RepeaterEvents ];

export class RepeaterEventBus {
	private listeners = new Map< string, Set< () => void > >();

	subscribe( eventName: RepeaterEventType, callback: () => void ) {
		if ( ! this.listeners.has( eventName ) ) {
			this.listeners.set( eventName, new Set() );
		}
		this.listeners.get( eventName )?.add( callback );

		return () => {
			this.listeners.get( eventName )?.delete( callback );
		};
	}

	emit( eventName: RepeaterEventType ) {
		this.listeners.get( eventName )?.forEach( ( callback ) => callback() );
	}
}

export const repeaterEventBus = new RepeaterEventBus();
