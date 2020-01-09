import BaseComponent from 'elementor-common/components/component';
import * as commands from './commands/';

export default class Component extends BaseComponent {
	getNamespace() {
		return 'editor/documents';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
