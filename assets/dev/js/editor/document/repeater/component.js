import * as Commands from './commands';

export default class Component extends elementorModules.common.Component {
	getNamespace() {
		return 'document/repeater';
	}

	defaultCommands() {
		return {
			duplicate: ( args ) => ( new Commands.Duplicate( args ) ).run(),
			insert: ( args ) => ( new Commands.Insert( args ) ).run(),
			move: ( args ) => ( new Commands.Move( args ) ).run(),
			remove: ( args ) => ( new Commands.Remove( args ) ).run(),
		};
	}
}
