import * as Commands from './commands/';

export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'document/dynamic';
	}

	defaultCommands() {
		return {
			settings: ( args ) => ( new Commands.Settings( args ) ).run(),
		};
	}
}
