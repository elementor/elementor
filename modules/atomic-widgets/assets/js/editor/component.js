import * as hooks from './hooks';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'document/atomic-widgets';
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}
}
