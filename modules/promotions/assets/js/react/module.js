import ReactPromotionBehavior from './behavior';
import { ANIMATED_HEADLINE, CTA, IMAGE_CAROUSEL, VIDEO_PLAYLIST, TESTIMONIAL_WIDGET } from './utils/consts';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		elementor.hooks.addFilter( 'controls/base/behaviors', this.registerControlBehavior );
	}

	registerControlBehavior( behaviors, view ) {
		const promotionsToSkip = [ `${ ANIMATED_HEADLINE }_promotion`, `${ CTA }_promotion`, `${ IMAGE_CAROUSEL }_promotion`, `${ VIDEO_PLAYLIST }_promotion`, `${ TESTIMONIAL_WIDGET }_promotion` ];

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
