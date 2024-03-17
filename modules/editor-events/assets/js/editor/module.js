import EventsStorage from './events-storage';
import eventsConfig from './events-config';
import Event from './event';

export default class extends elementorModules.Module {
	onInit() {
		this.config = eventsConfig;

		if ( ! elementor.config.editor_events?.can_send_events ) {
			return;
		}

		window.addEventListener( 'beforeunload', this.sendEvents() );
	}

	dispatchEvent( data ) {
		if ( ! elementor.config.editor_events?.can_send_events ) {
			return;
		}

		const newEvent = new Event( data );
		const eventBlob = new Blob( [ JSON.stringify( newEvent ) ], { type: 'application/json' } );

		if ( navigator.sendBeacon( elementor.config.editor_events.data_system_url, eventBlob ) ) {
			return;
		}

		EventsStorage.set( newEvent );
	}

	sendEvents() {
		const events = EventsStorage.get();

		if ( ! events.length ) {
			return;
		}

		fetch( elementor.config.editor_events.data_system_url, {
			body: JSON.stringify( events ),
			method: 'POST',
			credentials: 'omit',
			keepalive: true,
		} )
			.then( () => {
				EventsStorage.clear();
			} );
	}
}
