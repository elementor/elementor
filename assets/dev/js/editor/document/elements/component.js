import BaseComponent from 'elementor-common/components/component';
import * as commands from './commands/';

export default class Component extends BaseComponent {
	getNamespace() {
		return 'document/elements';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
