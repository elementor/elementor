import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'document/repeater';
	}

	defaultCommands() {
		return {
			duplicate: ( args ) => ( new commands.Duplicate( args ) ).run(),
			insert: ( args ) => ( new commands.Insert( args ) ).run(),
			move: ( args ) => ( new commands.Move( args ) ).run(),
			remove: ( args ) => ( new commands.Remove( args ) ).run(),
		};
	}
}
