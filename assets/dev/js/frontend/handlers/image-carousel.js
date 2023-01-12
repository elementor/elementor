export default class ImageCarousel extends elementorModules.frontend.handlers.SwiperBase {
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
			$swiperContainer: this.$element.find( selectors.carousel ),
		};

		elements.$slides = elements.$swiperContainer.find( selectors.slideContent );

		return elements;
	}

	getSwiperSettings() {
		const elementSettings = this.getElementSettings(),
			slidesToShow = +elementSettings.slides_to_show || 3,
			isSingleSlide = 1 === slidesToShow,
			elementorBreakpoints = elementorFrontend.config.responsive.activeBreakpoints,
			defaultSlidesToShowMap = {
				mobile: 1,
				tablet: isSingleSlide ? 1 : 2,
			};

		const swiperOptions = {
			slidesPerView: slidesToShow,
			loop: 'yes' === elementSettings.infinite,
			speed: elementSettings.speed,
			handleElementorBreakpoints: true,
		};

		swiperOptions.breakpoints = {};

		let lastBreakpointSlidesToShowValue = slidesToShow;

		Object.keys( elementorBreakpoints ).reverse().forEach( ( breakpointName ) => {
			// Tablet has a specific default `slides_to_show`.
			const defaultSlidesToShow = defaultSlidesToShowMap[ breakpointName ] ? defaultSlidesToShowMap[ breakpointName ] : lastBreakpointSlidesToShowValue;

			swiperOptions.breakpoints[ elementorBreakpoints[ breakpointName ].value ] = {
				slidesPerView: +elementSettings[ 'slides_to_show_' + breakpointName ] || defaultSlidesToShow,
				slidesPerGroup: +elementSettings[ 'slides_to_scroll_' + breakpointName ] || 1,
			};

			lastBreakpointSlidesToShowValue = +elementSettings[ 'slides_to_show_' + breakpointName ] || defaultSlidesToShow;
		} );

		if ( 'yes' === elementSettings.autoplay ) {
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
			swiperOptions.spaceBetween = this.getSpaceBetween();
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

		if ( 'yes' === elementSettings.lazyload ) {
			swiperOptions.lazy = {
				loadPrevNext: true,
				loadPrevNextAmount: 1,
			};
		}

		return swiperOptions;
	}

	async onInit( ...args ) {
		super.onInit( ...args );

		if ( ! this.elements.$swiperContainer.length || 2 > this.elements.$slides.length ) {
			return;
		}

		const Swiper = elementorFrontend.utils.swiper;

		this.swiper = await new Swiper( this.elements.$swiperContainer, this.getSwiperSettings() );

		// Expose the swiper instance in the frontend
		this.elements.$swiperContainer.data( 'swiper', this.swiper );

		const elementSettings = this.getElementSettings();
		if ( 'yes' === elementSettings.pause_on_hover ) {
			this.togglePauseOnHover( true );
		}
	}

	updateSwiperOption( propertyName ) {
		const elementSettings = this.getElementSettings(),
			newSettingValue = elementSettings[ propertyName ],
			params = this.swiper.params;

		// Handle special cases where the value to update is not the value that the Swiper library accepts.
		switch ( propertyName ) {
			case 'autoplay_speed':
				params.autoplay.delay = newSettingValue;

				break;
			case 'speed':
				params.speed = newSettingValue;

				break;
		}

		this.swiper.update();
	}

	getChangeableProperties() {
		return {
			pause_on_hover: 'pauseOnHover',
			autoplay_speed: 'delay',
			speed: 'speed',
			arrows_position: 'arrows_position', // Not a Swiper setting.
		};
	}

	onElementChange( propertyName ) {
		if ( 0 === propertyName.indexOf( 'image_spacing_custom' ) ) {
			this.updateSpaceBetween( propertyName );
			return;
		}

		const changeableProperties = this.getChangeableProperties();

		if ( changeableProperties[ propertyName ] ) {
			// 'pause_on_hover' is implemented by the handler with event listeners, not the Swiper library.
			if ( 'pause_on_hover' === propertyName ) {
				const newSettingValue = this.getElementSettings( 'pause_on_hover' );

				this.togglePauseOnHover( 'yes' === newSettingValue );
			} else {
				this.updateSwiperOption( propertyName );
			}
		}
	}

	onEditSettingsChange( propertyName ) {
		if ( 'activeItemIndex' === propertyName ) {
			this.swiper.slideToLoop( this.getEditSettings( 'activeItemIndex' ) - 1 );
		}
	}

	/**
	 * Get the value of a responsive control.
	 *
	 * Retrieves the value of a responsive control for the current device or for this first parent device which has a control value.
	 *
	 * @since 3.11.0
	 *
	 * @param {{}}     controlSettings A settings object (e.g. element settings - keys and values)
	 * @param {string} controlKey      The control key name
	 * @param {string} controlSubKey   A specific property of the control object.
	 * @return {*} Control Value
	 */
	getResponsiveControlValue( controlSettings, controlKey, controlSubKey = '', device = null ) {
		const currentDeviceMode = device || elementorFrontend.getCurrentDeviceMode(),
			controlValueDesktop = this.getControlValue( controlSettings, controlKey, controlSubKey );

		// Set the control value for the current device mode.
		// First check the widescreen device mode.
		if ( 'widescreen' === currentDeviceMode ) {
			const controlValueWidescreen = this.getControlValue( controlSettings, `${ controlKey }_widescreen`, controlSubKey );

			return ( controlValueWidescreen || 0 === controlValueWidescreen ) ? controlValueWidescreen : controlValueDesktop;
		}

		// Loop through all responsive and desktop device modes.
		const activeBreakpoints = elementorFrontend.breakpoints.getActiveBreakpointsList( { withDesktop: true } );

		let parentDeviceMode = currentDeviceMode,
			deviceIndex = activeBreakpoints.indexOf( currentDeviceMode ),
			controlValue = '';

		while ( deviceIndex <= activeBreakpoints.length ) {
			if ( 'desktop' === parentDeviceMode ) {
				controlValue = controlValueDesktop;
				break;
			}

			const responsiveControlKey = `${ controlKey }_${ parentDeviceMode }`,
				responsiveControlValue = this.getControlValue( controlSettings, responsiveControlKey, controlSubKey );

			if ( responsiveControlValue || 0 === responsiveControlValue ) {
				controlValue = responsiveControlValue;
				break;
			}

			// If no control value has been set for the current device mode, then check the parent device mode.
			deviceIndex++;
			parentDeviceMode = activeBreakpoints[ deviceIndex ];
		}

		return controlValue;
	}

	/**
	 * Get Control Value
	 *
	 * Retrieves a control value.
	 *
	 * @since 3.11.0
	 *
	 * @param {{}}     controlSettings A settings object (e.g. element settings - keys and values)
	 * @param {string} controlKey      The control key name
	 * @param {string} controlSubKey   A specific property of the control object.
	 * @return {*} Control Value
	 */
	getControlValue( controlSettings, controlKey, controlSubKey = '' ) {
		let value;

		if ( 'object' === typeof controlSettings[ controlKey ] && controlSubKey ) {
			value = controlSettings[ controlKey ][ controlSubKey ];
		} else {
			value = controlSettings[ controlKey ];
		}

		return value;
	}

	getSpaceBetween( device = null ) {
		return this.getResponsiveControlValue( this.getElementSettings(), 'image_spacing_custom', 'size', device ) || 0 ;
	}

	updateSpaceBetween( propertyName ) {
		const deviceMatch = propertyName.match( 'image_spacing_custom_(.*)' ),
			device = deviceMatch ? deviceMatch[ 1 ] : 'desktop',
			newSpaceBetween = this.getSpaceBetween( device );

		if ( 'desktop' !== device ) {
			this.swiper.params.breakpoints[ this.getDeviceBreakpointValue( device ) ].spaceBetween = newSpaceBetween;
		} else {
			this.swiper.params.spaceBetween = newSpaceBetween;
		}

		this.swiper.params.spaceBetween = newSpaceBetween;

		this.swiper.update();
	}

	getDeviceBreakpointValue( device ) {
		if ( ! this.breakpointsDictionary ) {
			const breakpoints = elementorFrontend.config.responsive.activeBreakpoints;

			this.breakpointsDictionary = {};

			Object.keys( breakpoints ).forEach( ( breakpointName ) => {
				this.breakpointsDictionary[ breakpointName ] = breakpoints[ breakpointName ].value;
			} );
		}

		return this.breakpointsDictionary[ device ];
	}
}
