import NestedTabsComponent from './nested-tabs/component';
import * as hooks from './hooks/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'nested-elements';
	}

	registerAPI() {
		super.registerAPI();

		$e.components.register( new NestedTabsComponent() );
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}
}
