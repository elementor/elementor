import ComponentBase from 'elementor-api/modules/component-base';

import * as commands from './commands/';

export default class Component extends ComponentBase {
	__construct( args = {} ) {
		super.__construct( args );
	}

	getNamespace() {
		return 'globals/typography';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
