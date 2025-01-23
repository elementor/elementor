import * as commands from './commands/';
import * as commandsInternal from './commands-internal/';
import * as hooks from './hooks';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'document/atomic-widgets';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultCommandsInternal() {
		return this.importCommands( commandsInternal );
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}
}
