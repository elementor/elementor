import * as Hooks from './callbacks/hooks/';
import BackwardsCompatibility from './backwards-compatibility.js';

export default class Component extends elementorModules.common.Component {
	onInit() {
		new BackwardsCompatibility();

		super.onInit();

		this.hooks = {};

		// Load hooks.
		Object.entries( Hooks ).forEach( ( [ hook, hookReference ] ) =>
			this.hooks[ hook ] = new hookReference()
		);
	}

	getNamespace() {
		return 'document';
	}

	defaultCommands() {
		return {
			//example: ( args ) => ( new Commands.Example( args ).run() ),
		};
	}
}
