import ReactPromotionBehavior from './behavior';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		elementor.hooks.addFilter( 'controls/base/behaviors', this.registerControlBehavior );
	}

	registerControlBehavior( behaviors, view ) {
		const promotionsToSkip = [ 'animated_heading_promotion' ];

		if ( ! promotionsToSkip.includes( view.options.model.get( 'name' ) ) ) {
			return behaviors;
		}

		if ( ! behaviors ) {
			behaviors = {};
		}

		behaviors.reactPromotions = {
			behaviorClass: ReactPromotionBehavior,
		};

		console.log( 'behaviors: ', behaviors );

		return behaviors;
	}
}
