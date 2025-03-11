import PromotionControl from './controls/promotion';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		elementor.addControlView( 'promotion_control', PromotionControl );

		// Possibly we add a view or filter for the category panel here.
	}
}
