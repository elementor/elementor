export default class WpAudio extends elementorModules.frontend.handlers.Base {
	onInit() {
		super.onInit();

		window.wp.mediaelement.initialize()
	}
}
