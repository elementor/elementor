import CarouselBase from 'elementor-frontend/handlers/base-carousel';

export default class ImageCarousel extends CarouselBase {
	getDefaultSettings() {
		const settings = super.getDefaultSettings();

		settings.selectors.carousel = '.elementor-image-carousel-wrapper';

		return settings;
	}
}
