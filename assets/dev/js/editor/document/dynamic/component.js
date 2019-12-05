import * as Commands from './commands/';

export default class Component extends elementorModules.common.Component {
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
