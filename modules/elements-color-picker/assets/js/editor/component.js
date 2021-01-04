import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';
import * as hooks from './hooks/';

export default class Component extends ComponentBase {

	currentPicker = {
		container: null,
		control: null,
	};

	getNamespace() {
		return 'elements-color-picker';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}
}
