import ReactPromotionBehavior from './behavior';
import { ANIMATED_HEADLINE, CTA, IMAGE_CAROUSEL, VIDEO_PLAYLIST, TESTIMONIAL_WIDGET } from './utils/consts';
import PromotionControl from './controls/promotion';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		elementor.addControlView( 'promotion_control', PromotionControl );
	}
}
