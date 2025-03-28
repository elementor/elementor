import * as hooks from './hooks/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'cloud-library';
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}
}
