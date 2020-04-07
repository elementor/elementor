class ImageCarouselHandler extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				carousel: '.elementor-image-carousel-wrapper',
				slideContent: '.swiper-slide',
				navButtons: '.elementor-swiper-button',
				pagination: '.swiper-pagination',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		const elements = {
			$carousel: this.$element.find( selectors.carousel ),
			$navButtons: this.$element.find( selectors.navButtons ),
			$pagination: this.$element.find( selectors.pagination ),
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
			handleElementorBreakpoints: true,
			navigation: {
				prevEl: '.elementor-swiper-button-prev',
				nextEl: '.elementor-swiper-button-next',
			},
			pagination: {
				el: '.swiper-pagination',
				type: 'bullets',
				clickable: true,
			},
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
				disableOnInteraction: 'yes' === elementSettings.pause_on_interaction,
			};
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

		// Navigation and pagination markup now always exists but defaults to 'display: none'.
		if ( showArrows ) {
			this.elements.$navButtons.show();
		}

		if ( showDots ) {
			this.elements.$pagination.show();
		}

		return swiperOptions;
	}

	onInit( ...args ) {
		super.onInit( ...args );

		const elementSettings = this.getElementSettings();

		if ( ! this.elements.$carousel.length || 2 > this.elements.$swiperSlides.length ) {
			return;
		}

		this.swiper = new Swiper( this.elements.$carousel, this.getSwiperSettings() );

		// Expose the swiper instance in the frontend
		this.elements.$carousel.data( 'swiper', this.swiper );

		if ( 'yes' === elementSettings.pause_on_hover ) {
			this.togglePauseOnHover( true );
		}
	}

	// This method live-handles the 'Pause On Hover' control's value being changed in the Editor Panel
	togglePauseOnHover( toggleOn ) {
		if ( toggleOn ) {
			this.elements.$carousel.on( {
				mouseenter: () => {
					this.swiper.autoplay.stop();
				},
				mouseleave: () => {
					this.swiper.autoplay.start();
				},
			} );
		} else {
			this.elements.$carousel.off( 'mouseenter mouseleave' );
		}
	}

	updateSwiperOption( propertyName ) {
		const elementSettings = this.getElementSettings(),
			newSettingValue = elementSettings[ propertyName ],
			changeableProperties = this.getChangeableProperties();

		let propertyToUpdate = changeableProperties[ propertyName ],
			valueToUpdate = newSettingValue;

		// Handle special cases where the value to update is not the value that the Swiper library accepts
		switch ( propertyName ) {
			case 'image_spacing_custom':
				valueToUpdate = newSettingValue.size || 0;
				break;
			case 'autoplay':
				if ( newSettingValue ) {
					valueToUpdate = {
						delay: elementSettings.autoplay_speed,
						disableOnInteraction: 'yes' === elementSettings.pause_on_interaction,
					};
				} else {
					valueToUpdate = false;
				}
				break;
			case 'autoplay_speed':
				propertyToUpdate = 'autoplay';

				valueToUpdate = {
					delay: newSettingValue,
					disableOnInteraction: 'yes' === elementSettings.pause_on_interaction,
				};
				break;
			case 'pause_on_hover':
				this.togglePauseOnHover( 'yes' === newSettingValue );
				break;
			case 'effect':
				if ( 'fade' === newSettingValue ) {
					this.swiper.params.fadeEffect = { crossFade: true };
				} else {
					this.swiper.params.fadeEffect = false;
				}
				break;
			case 'navigation':
				if ( 'arrows' === newSettingValue ) {
					this.elements.$navButtons.show();
					this.elements.$pagination.hide();
				} else if ( 'dots' === newSettingValue ) {
					this.elements.$pagination.show();
					this.elements.$navButtons.hide();
				} else if ( 'both' === newSettingValue ) {
					this.elements.$pagination.show();
					this.elements.$navButtons.show();
				} else {
					this.elements.$navButtons.hide();
					this.elements.$pagination.hide();
				}
				break;
			case 'pause_on_interaction':
				valueToUpdate = 'yes' === newSettingValue;
				break;
		}

		// 'pause_on_hover' is implemented by the handler with event listeners, not the Swiper library
		if ( 'pause_on_hover' !== propertyName && 'navigation' !== propertyName ) {
			this.swiper.params[ propertyToUpdate ] = valueToUpdate;
		}
	}

	getChangeableProperties() {
		return {
			slides_to_show: 'slidesPerView',
			slides_to_scroll: 'slidesPerGroup',
			navigation: 'navigation', //
			autoplay: 'autoplay', //
			pause_on_hover: 'pauseOnHover', //
			pause_on_interaction: 'disableOnInteraction', //
			autoplay_speed: 'delay', //
			effect: 'effect', //
			speed: 'speed',
			image_spacing_custom: 'spaceBetween', //
		};
	}

	onElementChange( propertyName ) {
		const changeableProperties = this.getChangeableProperties();

		if ( changeableProperties.hasOwnProperty( propertyName ) ) {
			this.updateSwiperOption( propertyName );

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
