import ComponentBase from 'elementor-api/modules/component-base';

import * as hooks from './hooks/';
import * as internalCommands from './commands/internal/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'screenshots';
	}

	defaultCommandsInternal() {
		return this.importCommands( internalCommands );
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}
}
