import Component from './component';
import WidgetContainer from './views/widget-repeater';
import WidgetContainerEmpty from './views/widget-repeater/empty';
import WidgetRepeaterModel from './models/widget-repeater-model';

export default class NestedElementsModule extends elementorModules.editor.utils.Module {
	onElementorInitComponents() {
		elementor.registerElementType( {
			elType: 'widget',
			widgetType: 'nested-tabs',
			View: WidgetContainer,
			Model: WidgetRepeaterModel,
			EmptyView: WidgetContainerEmpty,
		} );

		elementor.hooks.addFilter( 'elementor/editor/navigator/element/has-children', ( defaultReturn, model ) => {
			if ( this.isWidgetSupportNesting( model.get( 'widgetType' ) ) ) {
				return true;
			}

			return defaultReturn;
		} );

		this.component = $e.components.register( new Component() );
	}

	isWidgetSupportNesting( widgetType ) {
		// eslint-disable-next-line camelcase
		return elementor.widgetsCache[ widgetType ]?.support_nesting;
	}
}

