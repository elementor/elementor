import * as dataCommands from './commands';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'kits';
	}

	defaultData() {
		return this.importCommands( dataCommands );
	}
}
