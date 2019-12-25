import BaseComponent from 'elementor-api/modules/component';
import BackwardsCompatibility from './backwards-compatibility.js';
import * as Hooks from './callback/hooks/';
import * as Events from './callback/events/';

export default class Component extends BaseComponent {
	getNamespace() {
		return 'document';
	}

	onInit() {
		new BackwardsCompatibility();

		super.onInit();

		Object.values( Hooks ).forEach( ( hook ) => new hook() );
		Object.values( Events ).forEach( ( event ) => new event() );
	}

	defaultCommands() {
		return {
			//example: ( args ) => ( new Commands.Example( args ).run() ),
		};
	}
}
