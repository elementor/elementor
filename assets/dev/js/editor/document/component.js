import * as Hooks from './callbacks/hooks/';
import * as Events from './callbacks/events/';
import BackwardsCompatibility from './backwards-compatibility.js';

export default class Component extends elementorModules.common.Component {
	onInit() {
		new BackwardsCompatibility();

		super.onInit();

		Object.values( Hooks ).forEach( ( hook ) => new hook() );
		Object.values( Events ).forEach( ( event ) => new event() );
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
