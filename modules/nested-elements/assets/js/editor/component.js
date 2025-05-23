import NestedRepeaterComponent from './nested-repeater/component';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'nested-elements';
	}

	registerAPI() {
		$e.components.register( new NestedRepeaterComponent() );

		super.registerAPI();
	}
}
