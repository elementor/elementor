import BaseComponent from 'elementor-api/modules/component';
import * as Commands from './commands/';

export default class Component extends BaseComponent {
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
