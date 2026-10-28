const STORAGE_KEY = 'elementor_core_onboarding_event_queue';
const MAX_QUEUE_SIZE = 200;

export function enqueueEvent( name, payload, dedupeKey = null ) {
	try {
		const queue = getEventQueue();
		if ( dedupeKey && queue.some( ( item ) => item.dedupeKey === dedupeKey ) ) {
			return;
		}

		queue.push( {
			name,
			payload,
			timestamp: Date.now(),
			dedupeKey,
		} );

		while ( queue.length > MAX_QUEUE_SIZE ) {
			queue.shift();
		}

		sessionStorage.setItem( STORAGE_KEY, JSON.stringify( queue ) );
	} catch ( error ) {
		// Storage unavailable or quota exceeded.
	}
}

export function getEventQueue() {
	try {
		const raw = sessionStorage.getItem( STORAGE_KEY );
		if ( ! raw ) {
			return [];
		}

		const parsed = JSON.parse( raw );
		return Array.isArray( parsed ) ? parsed : [];
	} catch ( error ) {
		return [];
	}
}

export function removeSentEvents( sentDedupeKeys ) {
	try {
		const queue = getEventQueue();
		const remaining = queue.filter( ( item ) => {
			if ( ! item.dedupeKey ) {
				return true;
			}
			return ! sentDedupeKeys.includes( item.dedupeKey );
		} );
		sessionStorage.setItem( STORAGE_KEY, JSON.stringify( remaining ) );
	} catch ( error ) {
		// Storage unavailable.
	}
}

export function clearEventQueue() {
	try {
		sessionStorage.removeItem( STORAGE_KEY );
	} catch ( error ) {
		// Storage unavailable.
	}
}

const EventQueue = {
	enqueueEvent,
	getEventQueue,
	removeSentEvents,
	clearEventQueue,
};

export default EventQueue;
