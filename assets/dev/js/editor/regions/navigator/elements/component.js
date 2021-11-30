import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';
import * as hooks from './hooks/';

export default class Component extends ComponentBase {
	sharedViews = {};

	getNamespace() {
		return 'navigator/elements';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}

	getElementView( id ) {
		return this.sharedViews[ id ];
	}

	getElementModel( id ) {
		return this.getElementView( id ).model;
	}
}
