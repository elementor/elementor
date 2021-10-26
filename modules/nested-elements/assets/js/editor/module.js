import Component from './component';
import WidgetContainer from './views/widget-container';
import WidgetContainerModel from './models/widget-container-model';

export default class NestedElementsModule extends elementorModules.editor.utils.Module {
	onElementorInitComponents() {
		elementor.hooks.addFilter( 'element/view', ( DefaultView, model ) => {
			if ( this.isWidgetSupportNesting( model.get( 'widgetType' ) ) ) {
				return WidgetContainer;
			}

			return DefaultView;
		} );

		elementor.hooks.addFilter( 'element/model', ( DefaultModel, attrs ) => {
			if ( this.isWidgetSupportNesting( attrs.widgetType ) ) {
				return WidgetContainerModel;
			}

			return DefaultModel;
		} );

		elementor.hooks.addFilter( 'elementor/editor/element/is-valid-child', ( defaultReturn, childModel, parentModel ) => {
			const parentElType = parentModel.get( 'elType' ),
				draggedElType = childModel.get( 'elType' );

			return 'container' === draggedElType &&
				'widget' === parentElType &&
				this.isWidgetSupportNesting( parentModel.get( 'widgetType' ) );
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

