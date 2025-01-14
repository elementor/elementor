import * as commandsData from './commands-data/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'global-query';
	}

	static getEndpointFormat() {
		return 'global-query';
	}

	defaultData() {
		return this.importCommands( commandsData );
	}
}
