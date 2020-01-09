import ComponentBase from 'elementor-api/modules/component-base';
import * as Commands from './commands/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'document/elements';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
