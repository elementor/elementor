export default class SocialIcons extends elementorModules.frontend.handlers.Base {
	onInit() {
		super.onInit();

		if ( elementorFrontend.utils.environment.safari ) {
			// Label widget for webkit compatibility
			this.$element.addClass( 'elementor-safari' );
		}
	}
}
