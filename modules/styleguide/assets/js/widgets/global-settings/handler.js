export default class Handler extends elementorModules.frontend.handlers.Base {
	onInit() {
		super.onInit();

		document.querySelector( '.elementor-global-settings-widget' ).innerHTML = '.';
	}
}
