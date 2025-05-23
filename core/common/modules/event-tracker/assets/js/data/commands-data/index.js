import CommandData from 'elementor-api/modules/command-data';

export class Index extends CommandData {
	static getEndpointFormat() {
		return 'send-event';
	}
}
