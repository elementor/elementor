import PromotionBehavior from './behavior';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		// For testing purposes.
		elementor.hooks.addFilter( 'panel/category/behaviors', this.registerControlBehavior );

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
		if ( 'V4 Elements' === view.options.model.attributes.title ) {
			// I tried to mimic the behavior of the other promotion apps here, but this doesn't seem to work.
			// This currently only works for the widgets.
			if ( ! behaviors ) {
				behaviors = {};
			}

			behaviors.promotions = {
				behaviorClass: PromotionBehavior,
			};

			return behaviors;
		}

		const promotionsToSkip = [ 'display_conditions_pro', 'scrolling_effects_pro', 'mouse_effects_pro', 'sticky_pro' ];
		if ( ! promotionsToSkip.includes( view.options.model.get( 'name' ) ) ) {
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
