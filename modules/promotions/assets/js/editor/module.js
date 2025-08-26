import PromotionBehavior from './behavior';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		if ( ! this.hasPromotionWidgets() && ! this.hasIntegrationWidgets() ) {
			return;
		}

		elementor.hooks.addFilter( 'element/view', function( DefaultView, model ) {
			const widgetType = model.get( 'widgetType' );
<<<<<<< HEAD
			const isProWidget = elementor.config?.promotionWidgets?.find( ( item ) => widgetType === item.name );
=======
			const { config } = elementor;
>>>>>>> 574f36d00e (Tweak: Cherry-pick PR 32183 to 3.31 Added accessibility Hint [APP-1307] [ED-19619] (#32326))

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

			const isIntegrationWidget = elementor.config?.integrationWidgets?.find( ( item ) => widgetType === item.name );
			if ( isIntegrationWidget ) {
				return require( './widget/view' ).default;
			}

			return DefaultView;
		} );

		elementor.hooks.addFilter( 'controls/base/behaviors', this.registerControlBehavior );
	}

<<<<<<< HEAD
	hasPromotionWidgets() {
		return elementor.config?.promotionWidgets && elementor.config.promotionWidgets.length;
	}

	hasIntegrationWidgets() {
		return elementor.config?.integrationWidgets && elementor.config.integrationWidgets.length;
=======
	hasWidgetsElements( path ) {
		return elementor.config?.[ path ]?.length;
	}

	hasPromotionWidgets() {
		return this.hasWidgetsElements( 'promotionWidgets' );
	}

	hasIntegrationWidgets() {
		return this.hasWidgetsElements( 'integrationWidgets' );
>>>>>>> 574f36d00e (Tweak: Cherry-pick PR 32183 to 3.31 Added accessibility Hint [APP-1307] [ED-19619] (#32326))
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
