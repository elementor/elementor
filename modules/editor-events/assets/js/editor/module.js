import EventsStorage from './events-storage';
import Event from './event';

export default class extends elementorModules.Module {
	actions = {
		click: 'click',
	};

	sections = {
		topbar: 'topbar',
	};

	elementNames = {
		siteSettings: 'site_settings',
	};

	types = {
		button: 'button',
	};

	onInit() {
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
