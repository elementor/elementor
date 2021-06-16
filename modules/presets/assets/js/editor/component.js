import * as commands from './commands/index';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'presets';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
