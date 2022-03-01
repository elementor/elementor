import NestedRepeaterComponent from './nested-repeater/component';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'nested-elements';
	}

	registerAPI() {
		$e.components.register( new NestedRepeaterComponent() );

		super.registerAPI();
	}

	isWidgetSupportNesting( widgetType ) {
		// eslint-disable-next-line camelcase
		return elementor.widgetsCache[ widgetType ]?.support_nesting;
	}
}
