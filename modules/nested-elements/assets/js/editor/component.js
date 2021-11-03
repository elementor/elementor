import * as hooks from './hooks/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'nested-elements';
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}
}
