import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentBase {
	currentPicker = {
		container: null,
		control: null,
		initialColor: null,
	};

	getNamespace() {
		return 'elements-color-picker';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultShortcuts() {
		return {
			apply: {
				keys: 'esc',
				scopes: [ 'panel', 'preview' ],
			},
		};
	}
}
