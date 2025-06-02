import * as commandsData from './commands-data';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'kits-cloud-eligibility';
	}

	defaultData() {
		return this.importCommands( commandsData );
	}
}
