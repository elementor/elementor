class ImageCarousel extends elementorModules.frontend.handlers.CarouselBase {
	getDefaultSettings() {
		const settings = super.getDefaultSettings();

		settings.selectors.carousel = '.elementor-image-carousel-wrapper';

		return settings;
	}
}

window.elementorModules.frontend.widgets = elementorModules.frontend.widgets || {};
window.elementorModules.frontend.widgets[ 'image-carousel.default' ] = ImageCarousel;

export default ImageCarousel;
