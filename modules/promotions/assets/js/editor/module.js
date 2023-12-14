import PromotionBehavior from './behavior';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		if ( ! elementor.config?.promotionWidgets || ! elementor.config.promotionWidgets.length ) {
			return;
		}

		elementor.hooks.addFilter( 'element/view', function( DefaultView, model ) {
			const widgetType = model.get( 'widgetType' );
			const isProWidget = elementor.config.promotionWidgets.find( ( item ) => widgetType === item.name );

			if ( isProWidget ) {
				return require( './widget/view' ).default;
			}

			return DefaultView;
		} );

		elementor.hooks.addFilter( 'controls/base/behaviors', this.registerControlBehavior );
	}

	registerControlBehavior( behaviors, view ) {
		if ( 'e_display_conditions_promotion' !== view.options.model.get( 'name' ) ) {
			return behaviors;
		}

		if ( ! behaviors ) {
			behaviors = {};
		}

		behaviors.promotions = {
			behaviorClass: PromotionBehavior,
		};

		return behaviors;
	}
}
