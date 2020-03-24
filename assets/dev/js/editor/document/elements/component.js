import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';
import * as dataCommands from './commands/data/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'document/elements';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultData() {
		return this.importCommands( dataCommands );
	}
}
