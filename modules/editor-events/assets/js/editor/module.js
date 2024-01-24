import EventsStorage from './events-storage';

export default class extends elementorModules.Module {
	types = {
		click: 'click',
	};

	events = {
		site_settings: 'site_settings',
	};

	onInit() {
		if ( ! elementor.config.editor_events?.can_send_events ) {
			return;
		}

		window.addEventListener( 'unload', this.sendEvents() );
	}

	dispatchEvent( type, eventId, context ) {
		if ( ! elementor.config.editor_events?.can_send_events ) {
			return;
		}

		EventsStorage.set( { type, event_id: eventId, context, timestamp: Date.now() } );
	}

	sendEvents() {
		const events = EventsStorage.get();

		if ( ! events.length ) {
			return;
		}

		EventsStorage.clear();

		if ( navigator.sendBeacon( elementor.config.editor_events.data_system_url, JSON.stringify( events ) ) ) {
			return;
		}

		fetch( elementor.config.editor_events.data_system_url, {
			body: JSON.stringify( events ),
			method: 'POST',
			credentials: 'omit',
			keepalive: true,
		} ).catch( console.error );
	}
}
