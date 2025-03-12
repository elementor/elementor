import * as commands from './commands/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'v4-alpha-chip';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
