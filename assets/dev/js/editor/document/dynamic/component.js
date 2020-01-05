import ComponentBase from 'elementor-api/modules/component-base';
import * as Commands from './commands/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'document/dynamic';
	}

	defaultCommands() {
		return {
			disable: ( args ) => ( new Commands.Disable( args ) ).run(),
			enable: ( args ) => ( new Commands.Enable( args ) ).run(),
			settings: ( args ) => ( new Commands.Settings( args ) ).run(),
		};
	}
}
