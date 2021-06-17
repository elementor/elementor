import * as commands from './commands/index';
import * as dataCommands from './data-commands/index';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'presets';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultData() {
		return this.importCommands( dataCommands );
	}
}
