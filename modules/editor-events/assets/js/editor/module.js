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

		window.addEventListener( 'beforeunload', this.sendEvents() );
	}

	dispatchEvent( type, eventId, context ) {
		if ( ! elementor.config.editor_events?.can_send_events ) {
			return;
		}

		const newEvent = { type, event_id: eventId, context, timestamp: Date.now() };

		if ( navigator.sendBeacon( elementor.config.editor_events.data_system_url, JSON.stringify( newEvent ) ) ) {
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
