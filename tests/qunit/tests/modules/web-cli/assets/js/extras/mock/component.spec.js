import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/index.spec';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'test-hash-commands';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
