import eventsConfig from './events-config';

export default class extends elementorModules.Module {
	onInit() {
		this.config = eventsConfig;

		if ( ! elementor.config.editor_events?.can_send_events ) {

		}
	}
}
