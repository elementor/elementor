import ComponentBase from 'elementor-api/modules/component-base';
import * as commandsData from './commands/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'globals';
	}

	defaultData() {
		return this.importCommands( commandsData );
	}
}
