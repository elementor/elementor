import ComponentBase from 'elementor-api/modules/component-base';
import BackwardsCompatibility from './backwards-compatibility.js';
import * as DataHooks from './hooks/data/';
import * as UIHooks from './hooks/ui/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'document';
	}

	onInit() {
		new BackwardsCompatibility();

		super.onInit();

		Object.values( DataHooks ).forEach( ( hook ) => new hook() );
		Object.values( UIHooks ).forEach( ( hook ) => new hook() );
	}

	defaultCommands() {
		return {
			//example: ( args ) => ( new Commands.Example( args ).run() ),
		};
	}
}
