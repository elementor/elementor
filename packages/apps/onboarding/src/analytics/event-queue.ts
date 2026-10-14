const STORAGE_KEY = 'elementor_ob_event_queue';

interface QueuedEvent {
	name: string;
	payload: Record< string, unknown >;
	timestamp: number;
}

export function enqueueEvent( name: string, payload: Record< string, unknown > ): void {
	try {
		const queue = getEventQueue();
		queue.push( { name, payload, timestamp: Date.now() } );
		sessionStorage.setItem( STORAGE_KEY, JSON.stringify( queue ) );
	} catch {}
}

export function getEventQueue(): QueuedEvent[] {
	try {
		const raw = sessionStorage.getItem( STORAGE_KEY );
		return raw ? JSON.parse( raw ) : [];
	} catch {
		return [];
	}
}

export function clearEventQueue(): void {
	try {
		sessionStorage.removeItem( STORAGE_KEY );
	} catch {}
}
