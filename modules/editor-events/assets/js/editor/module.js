import eventsConfig from './events-config';
import mixpanel from 'mixpanel-browser';
import Event from './event';

export default class extends elementorModules.Module {
	onInit() {
		this.config = eventsConfig;

		if ( elementor.config.editor_events?.can_send_events ) {
			mixpanel.init( elementor.config.editor_events?.token, { persistence: 'localStorage' } );
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
