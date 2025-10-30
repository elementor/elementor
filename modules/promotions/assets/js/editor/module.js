import PromotionBehavior from './behavior';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		if ( ! this.hasPromotionWidgets() && ! this.hasIntegrationWidgets() ) {
			return;
		}

		elementor.hooks.addFilter( 'element/view', function( DefaultView, model ) {
			const widgetType = model.get( 'widgetType' );
			const { config } = elementor;

			const hasWidget = ( path ) => !! config[ path ].find( ( item ) => widgetType === item.name );

			let isProWidget = false,
				isIntegrationWidget = false;

			if ( config?.promotionWidgets?.length ) {
				isProWidget = hasWidget( 'promotionWidgets' );
			}

			if ( config?.integrationWidgets?.length && ! isProWidget ) {
				isIntegrationWidget = hasWidget( 'integrationWidgets' );
			}

			if ( isProWidget || isIntegrationWidget ) {
				return require( './widget/view' ).default;
			}

			return DefaultView;
		} );

		elementor.hooks.addFilter( 'controls/base/behaviors', this.registerControlBehavior );
	}

	hasWidgetsElements( path ) {
		return elementor.config?.[ path ]?.length;
	}

	hasPromotionWidgets() {
		return this.hasWidgetsElements( 'promotionWidgets' );
	}

	hasIntegrationWidgets() {
		return this.hasWidgetsElements( 'integrationWidgets' );
	}

	registerControlBehavior( behaviors, view ) {
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
