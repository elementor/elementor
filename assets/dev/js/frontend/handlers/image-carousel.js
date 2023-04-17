export default class ImageCarousel extends elementorModules.frontend.handlers.CarouselCoreBase {
	getDefaultSettings() {
		const settings = super.getDefaultSettings();

		settings.selectors.carousel = '.elementor-image-carousel-wrapper';

		return settings;
	}
}
