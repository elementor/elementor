import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'navigator/elements';
	}

	defaultCommands() {
		return {
			hide: ( args ) => ( new commands.Hide( args ) ).run(),
			show: ( args ) => ( new commands.Show( args ) ).run(),
			'toggle-all': ( args ) => ( new commands.ToggleAll( args ) ).run(),
			'toggle-visibility': ( args ) => ( new commands.ToggleVisibility( args ) ).run(),
		};
	}
}
