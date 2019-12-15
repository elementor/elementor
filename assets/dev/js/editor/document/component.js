import BaseComponent from 'elementor-common/components/component';
import BackwardsCompatibility from './backwards-compatibility.js';
import * as Hooks from './callback/hooks/';
import * as Events from './callback/events/';

export default class Component extends BaseComponent {
	getNamespace() {
		return 'document';
	}

	registerAPI() {
		new BackwardsCompatibility();

		super.registerAPI();

		Object.values( Hooks ).forEach( ( hook ) => new hook() );
		Object.values( Events ).forEach( ( event ) => new event() );
	}

	defaultCommands() {
		return {
			//example: ( args ) => ( new Commands.Example( args ).run() ),
		};
	}
}
