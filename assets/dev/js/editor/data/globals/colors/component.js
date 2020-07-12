import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'globals/colors';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
