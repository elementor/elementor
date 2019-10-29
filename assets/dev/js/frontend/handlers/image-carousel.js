class ImageCarouselHandler extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				carousel: '.elementor-image-carousel-wrapper',
				slideContent: '.swiper-slide',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		const elements = {
			$carousel: this.$element.find( selectors.carousel ),
		};

		elements.$swiperSlides = elements.$carousel.find( selectors.slideContent );

		return elements;
	}

	getSlidesCount() {
		return this.elements.$swiperSlides.length;
	}

	getSwiperSettings() {
		const elementSettings = this.getElementSettings(),
			slidesToShow = +elementSettings.slides_to_show || 3,
			isSingleSlide = 1 === slidesToShow,
			defaultLGDevicesSlidesCount = isSingleSlide ? 1 : 2,
			elementorBreakpoints = elementorFrontend.config.breakpoints;

		const swiperOptions = {
			slidesPerView: slidesToShow,
			loop: 'yes' === elementSettings.infinite,
			speed: elementSettings.speed,
		};

		swiperOptions.breakpoints = {};

		swiperOptions.breakpoints[ elementorBreakpoints.md ] = {
			slidesPerView: +elementSettings.slides_to_show_mobile || 1,
			slidesPerGroup: +elementSettings.slides_to_scroll_mobile || 1,
		};

		swiperOptions.breakpoints[ elementorBreakpoints.lg ] = {
			slidesPerView: +elementSettings.slides_to_show_tablet || defaultLGDevicesSlidesCount,
			slidesPerGroup: +elementSettings.slides_to_scroll_tablet || 1,
		};

		if ( ! this.isEdit && 'yes' === elementSettings.autoplay ) {
			swiperOptions.autoplay = {
				delay: elementSettings.autoplay_speed,
				disableOnInteraction: !! elementSettings.pause_on_interaction,
			};
		}

		if ( true === swiperOptions.loop ) {
			swiperOptions.loopedSlides = this.getSlidesCount();
		}

		if ( isSingleSlide ) {
			swiperOptions.effect = elementSettings.effect;

			if ( 'fade' === elementSettings.effect ) {
				swiperOptions.fadeEffect = { crossFade: true };
			}
		} else {
			swiperOptions.slidesPerGroup = +elementSettings.slides_to_scroll || 1;
		}

		if ( elementSettings.image_spacing_custom ) {
			swiperOptions.spaceBetween = elementSettings.image_spacing_custom.size;
		}

		const showArrows = 'arrows' === elementSettings.navigation || 'both' === elementSettings.navigation,
			showDots = 'dots' === elementSettings.navigation || 'both' === elementSettings.navigation;

		if ( showArrows ) {
			swiperOptions.navigation = {
				prevEl: '.elementor-swiper-button-prev',
				nextEl: '.elementor-swiper-button-next',
			};
		}

		if ( showDots ) {
			swiperOptions.pagination = {
				el: '.swiper-pagination',
				type: 'bullets',
				clickable: true,
			};
		}

		return swiperOptions;
	}

	updateSpaceBetween() {
		this.swiper.params.spaceBetween = this.getElementSettings( 'image_spacing_custom' ).size || 0;

		this.swiper.update();
	}

	onInit( ...args ) {
		super.onInit( ...args );

		const elementSettings = this.getElementSettings();

		if ( ! this.elements.$carousel.length || 2 > this.elements.$swiperSlides.length ) {
			return;
		}

		this.swiper = new Swiper( this.elements.$carousel, this.getSwiperSettings() );

		if ( elementSettings.pause_on_hover ) {
			this.elements.$carousel.on( {
				mouseenter: () => {
					this.swiper.autoplay.stop();
				},
				mouseleave: () => {
					this.swiper.autoplay.start();
				},
			} );
		}
	}

	onElementChange( propertyName ) {
		if ( 0 === propertyName.indexOf( 'image_spacing_custom' ) ) {
			this.updateSpaceBetween();
		} else if ( 'arrows_position' === propertyName ) {
			this.swiper.update();
		}
	}

	onEditSettingsChange( propertyName ) {
		if ( 'activeItemIndex' === propertyName ) {
			this.swiper.slideToLoop( this.getEditSettings( 'activeItemIndex' ) - 1 );
		}
	}
}

export default ( $scope ) => {
	elementorFrontend.elementsHandler.addHandler( ImageCarouselHandler, { $element: $scope } );
};
