export default class SocialIcons extends elementorModules.frontend.handlers.Base {
	onInit() {
		super.onInit();

		if ( elementorFrontend.utils.environment.appleWebkit ) {
			// Label widget for compatibility with appleWebkit
			this.$element.addClass( 'elementor-safari' );
		}
	}
}
