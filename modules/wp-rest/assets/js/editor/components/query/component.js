import * as commandsData from './commands-data/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'wp-rest';
	}

	defaultData() {
		return this.importCommands( commandsData );
	}
}
