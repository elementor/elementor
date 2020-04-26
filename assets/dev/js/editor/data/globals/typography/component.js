import ComponentBase from 'elementor-api/modules/component-base';

import * as commands from './commands/';

export default class Component extends ComponentBase {
	__construct( args = {} ) {
		super.__construct( args );

		// TODO: Remove - Create testing compatibility.
		if ( elementorCommonConfig.isTesting ) {
			return;
		}
	}

	getNamespace() {
		return 'globals/typography';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}
}
