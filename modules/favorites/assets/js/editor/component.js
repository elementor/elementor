import * as commands from './commands';
import * as dataCommands from './commands-data';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'favorites';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultData() {
		return this.importCommands( dataCommands );
	}
}
