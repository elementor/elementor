import Component from './component';
import WidgetContainer from './views/widget-container';
import WidgetContainerEmpty from './views/widget-container/empty';
import WidgetContainerModel from './models/widget-container-model';

export default class NestedElementsModule extends elementorModules.editor.utils.Module {
	onElementorInitComponents() {
		elementor.registerElementType( {
			elType: 'widget',
			widgetType: 'nested-tabs',
            View: WidgetContainer,
			Model: WidgetContainerModel,
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

