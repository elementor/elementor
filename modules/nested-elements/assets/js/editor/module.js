import Component from './component';
import NestedTabs from './widgets/nested-tabs';

export default class NestedElementsModule extends elementorModules.editor.utils.Module {
	onElementorInitComponents() {
		elementor.registerElementType( new NestedTabs() );

		this.component = $e.components.register( new Component() );
	}

	isWidgetSupportNesting( widgetType ) {
		// eslint-disable-next-line camelcase
		return elementor.widgetsCache[ widgetType ]?.support_nesting;
	}
}

