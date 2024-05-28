import eventsConfig from './events-config';
import mixpanel from 'mixpanel-browser';
import Event from './event';

export default class extends elementorModules.Module {
	onInit() {
		this.config = eventsConfig;

		if ( elementor.config.editor_events?.can_send_events ) {
			mixpanel.init( '150605b3b9f979922f2ac5a52e2dcfe9', { debug: true, persistence: 'localStorage' } );
		}
	}

	dispatchEvent( name, data ) {
		if ( ! elementor.config.editor_events?.can_send_events ) {
			return;
		}

		const eventData = new Event( data );

		mixpanel.track(
			name,
			eventData,
		);
	}
}
