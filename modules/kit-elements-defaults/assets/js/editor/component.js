import * as hooks from './hooks';
import * as dataCommands from './data-commands/';
import * as commands from './commands/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'kit-elements-defaults';
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}

	defaultData() {
		return this.importCommands( dataCommands );
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
