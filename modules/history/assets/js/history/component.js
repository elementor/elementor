import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from 'elementor-document/history/commands/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'panel/history/actions';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultShortcuts() {
		return {
			undo: {
				keys: 'ctrl+z',
				exclude: [ 'input' ],
				scopes: [ 'panel', 'navigator' ],
			},
			redo: {
				keys: 'ctrl+shift+z, ctrl+y',
				exclude: [ 'input' ],
				scopes: [ 'panel', 'navigator' ],
			},
		};
	}
}
