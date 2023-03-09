import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'controls';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
