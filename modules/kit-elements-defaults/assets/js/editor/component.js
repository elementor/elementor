import * as hooks from './hooks';
import * as commands from './commands/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'kit-elements-defaults';
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
