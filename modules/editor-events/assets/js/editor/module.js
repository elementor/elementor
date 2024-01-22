export default class extends elementorModules.Module {
	sendEvent() {
		if ( ! elementor.config.editor_events.can_send_events ) {
			return;
		}

		const data = { type: 'click', option1: 'value1' };
		const resp = navigator.sendBeacon( elementor.config.editor_events.target, JSON.stringify( data ) );
	}
}
