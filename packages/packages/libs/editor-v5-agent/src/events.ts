import type { AgentEvent, AgentEventListener } from './types';

export class TypedEventEmitter {
	private listeners = new Map< string, Set< AgentEventListener > >();

	on( eventType: string, listener: AgentEventListener ): () => void {
		if ( ! this.listeners.has( eventType ) ) {
			this.listeners.set( eventType, new Set() );
		}

		this.listeners.get( eventType )?.add( listener );

		return () => {
			this.listeners.get( eventType )?.delete( listener );
		};
	}

	emit( event: AgentEvent ): void {
		const typeListeners = this.listeners.get( event.type );
		const allListeners = this.listeners.get( '*' );

		typeListeners?.forEach( ( listener ) => listener( event ) );
		allListeners?.forEach( ( listener ) => listener( event ) );
	}
}
