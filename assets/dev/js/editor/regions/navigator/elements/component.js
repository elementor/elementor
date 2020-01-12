import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'navigator/elements';
	}

	defaultCommands() {
		return {
			'toggle-all': ( args ) => ( new commands.ToggleAll( args ) ).run(),
		};
	}
}
