import ReactPromotionBehavior from './behavior';
import { ANIMATED_HEADLINE } from './utils/consts';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		elementor.hooks.addFilter( 'controls/base/behaviors', this.registerControlBehavior );
	}

	registerControlBehavior( behaviors, view ) {
		const promotionsToSkip = [ `${ ANIMATED_HEADLINE }_promotion` ];

		if ( ! promotionsToSkip.includes( view.options.model.get( 'name' ) ) ) {
			return behaviors;
		}

		if ( ! behaviors ) {
			behaviors = {};
		}

		behaviors.reactPromotions = {
			behaviorClass: ReactPromotionBehavior,
		};

		return behaviors;
	}
}
