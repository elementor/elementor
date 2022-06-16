import * as commands from './commands';
import * as commandsInternal from './commands-internal';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'editor/browser-import';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultCommandsInternal() {
		return this.importCommands( commandsInternal );
	}
}
