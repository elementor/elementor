import ComponentBase from 'elementor-api/modules/component-base';
import NavigateComponent from './navigate/component';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'finder';
	}

	registerAPI() {
		$e.components.register( new NavigateComponent( { manager: this } ) );
	}
}
