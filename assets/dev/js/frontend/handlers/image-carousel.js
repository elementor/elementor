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
			handleElementorBreakpoints: true,
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
			case 'pause_on_interaction':
				valueToUpdate = 'yes' === newSettingValue;
				break;
		}

		// 'pause_on_hover' is implemented by the handler with event listeners, not the Swiper library
		if ( 'pause_on_hover' !== propertyName ) {
			this.swiper.params[ propertyToUpdate ] = valueToUpdate;
		}

		this.swiper.update();
	}

	/*updateResponsiveSwiperOption( propertyName, currentDeviceMode ) {
		const elementSettings = this.getElementSettings(),
			changeableProperties = this.getChangeableProperties(),
			propertyToUpdate = changeableProperties[ propertyName.slice( 0, propertyName.indexOf( '_' + currentDeviceMode ) ) ],
			breakpoints = elementorFrontend.config.breakpoints,
			breakpointDictionary = {
				tablet: breakpoints.md,
				mobile: breakpoints.xs,
			};

		if ( 'desktop' === currentDeviceMode ) {
			this.swiper.params[ propertyToUpdate ] = elementSettings[ propertyName ];
		} else {
			this.swiper.params.breakpoints[ breakpointDictionary[ currentDeviceMode ] ][ propertyToUpdate ] = parseInt( elementSettings[ propertyName ] );

			// Reverse the breakpoints to adjust to Swiper 5.x
			//this.swiper.params = this.swiper.adjustConfig( this.swiper.params );
		}

		this.swiper.update();
	}*/

	getChangeableProperties() {
		return {
			//slides_to_show: 'slidesPerView',
			//slides_to_scroll: 'slidesPerGroup',
			autoplay: 'autoplay',
			pause_on_hover: 'pauseOnHover',
			pause_on_interaction: 'disableOnInteraction',
			autoplay_speed: 'delay',
			speed: 'speed',
			image_spacing_custom: 'spaceBetween',
		};
	}

	onElementChange( propertyName ) {
		const changeableProperties = this.getChangeableProperties();
		// const currentDeviceMode = elementorFrontend.getCurrentDeviceMode();

		// Handle responsive controls
		/*if ( propertyName.includes( '_' + currentDeviceMode ) ) {
			this.updateResponsiveSwiperOption( propertyName, currentDeviceMode );
		}*/

		if ( changeableProperties.propertyName ) {
			this.updateSwiperOption( propertyName );
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
