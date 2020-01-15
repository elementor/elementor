import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'document/dynamic';
	}

	defaultCommands() {
		return {
			disable: ( args ) => ( new commands.Disable( args ) ).run(),
			enable: ( args ) => ( new commands.Enable( args ) ).run(),
			settings: ( args ) => ( new commands.Settings( args ) ).run(),
		};
	}
}
