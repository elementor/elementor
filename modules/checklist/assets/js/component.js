import * as commands from './commands/';
import * as commandsData from './commands-data/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'checklist';
	}

	static getEndpointFormat() {
		return 'checklist';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultData() {
		return this.importCommands( commandsData );
	}
}
