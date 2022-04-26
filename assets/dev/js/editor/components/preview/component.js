import * as commands from './commands/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'preview';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
