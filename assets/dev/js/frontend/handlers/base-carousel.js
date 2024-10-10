import SwiperHandlerBase from './base-swiper';

export default class CarouselHandlerBase extends SwiperHandlerBase {
	getDefaultSettings() {
		return {
			selectors: {
				carousel: `.${ elementorFrontend.config.swiperClass }`,
				swiperWrapper: '.swiper-wrapper',
				slideContent: '.swiper-slide',
				swiperArrow: '.elementor-swiper-button',
				paginationWrapper: '.swiper-pagination',
				paginationBullet: '.swiper-pagination-bullet',
				paginationBulletWrapper: '.swiper-pagination-bullets',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' ),
			elements = {
				$swiperContainer: this.$element.find( selectors.carousel ),
				$swiperWrapper: this.$element.find( selectors.swiperWrapper ),
				$swiperArrows: this.$element.find( selectors.swiperArrow ),
				$paginationWrapper: this.$element.find( selectors.paginationWrapper ),
				$paginationBullets: this.$element.find( selectors.paginationBullet ),
				$paginationBulletWrapper: this.$element.find( selectors.paginationBulletWrapper ),
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

			if ( elementSettings.image_spacing_custom ) {
				swiperOptions.breakpoints[ elementorBreakpoints[ breakpointName ].value ].spaceBetween = this.getSpaceBetween( breakpointName );
			}

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
			showPagination = 'dots' === elementSettings.navigation || 'both' === elementSettings.navigation || elementSettings.pagination;

		if ( showArrows ) {
			swiperOptions.navigation = {
				prevEl: '.elementor-swiper-button-prev',
				nextEl: '.elementor-swiper-button-next',
			};
		}

		if ( showPagination ) {
			swiperOptions.pagination = {
				el: `.elementor-element-${ this.getID() } .swiper-pagination`,
				type: !! elementSettings.pagination ? elementSettings.pagination : 'bullets',
				clickable: true,
				renderBullet: ( index, classname ) => {
					return `<span class="${ classname }" role="button" tabindex="0" data-bullet-index="${ index }" aria-label="${ elementorFrontend.config.i18n.a11yCarouselPaginationBulletMessage } ${ index + 1 }"></span>`;
				},
			};
		}

		if ( 'yes' === elementSettings.lazyload ) {
			swiperOptions.lazy = {
				loadPrevNext: true,
				loadPrevNextAmount: 1,
			};
		}

		swiperOptions.a11y = {
			enabled: true,
			prevSlideMessage: elementorFrontend.config.i18n.a11yCarouselPrevSlideMessage,
			nextSlideMessage: elementorFrontend.config.i18n.a11yCarouselNextSlideMessage,
			firstSlideMessage: elementorFrontend.config.i18n.a11yCarouselFirstSlideMessage,
			lastSlideMessage: elementorFrontend.config.i18n.a11yCarouselLastSlideMessage,
		};

		swiperOptions.on = {
			slideChange: () => {
				this.a11ySetPaginationTabindex();
				this.handleElementHandlers();
				this.a11ySetSlideAriaHidden();
			},
			init: () => {
				this.a11ySetWidgetAriaDetails();
				this.a11ySetPaginationTabindex();
				this.a11ySetSlideAriaHidden( 'initialisation' );
			},
		};

		this.applyOffsetSettings( elementSettings, swiperOptions, slidesToShow );

		return swiperOptions;
	}

	getOffsetWidth() {
		const currentDevice = elementorFrontend.getCurrentDeviceMode();
		return elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), 'offset_width', 'size', currentDevice ) || 0;
	}

	applyOffsetSettings( elementSettings, swiperOptions, slidesToShow ) {
		const offsetSide = elementSettings.offset_sides,
			isNestedCarouselInEditMode = elementorFrontend.isEditMode() && 'NestedCarousel' === this.constructor.name;

		if ( isNestedCarouselInEditMode || ! offsetSide || 'none' === offsetSide ) {
			return;
		}

		switch ( offsetSide ) {
			case 'right':
				this.forceSliderToShowNextSlideWhenOnLast( swiperOptions, slidesToShow );
				this.addClassToSwiperContainer( 'offset-right' );
				break;
			case 'left':
				this.addClassToSwiperContainer( 'offset-left' );
				break;
			case 'both':
				this.forceSliderToShowNextSlideWhenOnLast( swiperOptions, slidesToShow );
				this.addClassToSwiperContainer( 'offset-both' );
				break;
		}
	}

	forceSliderToShowNextSlideWhenOnLast( swiperOptions, slidesToShow ) {
		swiperOptions.slidesPerView = slidesToShow + 0.001;
	}

	addClassToSwiperContainer( className ) {
		this.getDefaultElements().$swiperContainer[ 0 ].classList.add( className );
	}

	async onInit( ...args ) {
		super.onInit( ...args );

		if ( ! this.elements.$swiperContainer.length || 2 > this.elements.$slides.length ) {
			return;
		}

		await this.initSwiper();

		const elementSettings = this.getElementSettings();
		if ( 'yes' === elementSettings.pause_on_hover ) {
			this.togglePauseOnHover( true );
		}
	}

	async initSwiper() {
		const Swiper = elementorFrontend.utils.swiper;
		this.swiper = await new Swiper( this.elements.$swiperContainer, this.getSwiperSettings() );

		// Expose the swiper instance in the frontend
		this.elements.$swiperContainer.data( 'swiper', this.swiper );
	}

	bindEvents() {
		this.elements.$swiperArrows.on( 'keydown', this.onDirectionArrowKeydown.bind( this ) );
		this.elements.$paginationWrapper.on( 'keydown', '.swiper-pagination-bullet', this.onDirectionArrowKeydown.bind( this ) );
		this.elements.$swiperContainer.on( 'keydown', '.swiper-slide', this.onDirectionArrowKeydown.bind( this ) );
		this.$element.find( ':focusable' ).on( 'focus', this.onFocusDisableAutoplay.bind( this ) );
		elementorFrontend.elements.$window.on( 'resize', this.getSwiperSettings.bind( this ) );
	}

	unbindEvents() {
		this.elements.$swiperArrows.off();
		this.elements.$paginationWrapper.off();
		this.elements.$swiperContainer.off();
		this.$element.find( ':focusable' ).off();
		elementorFrontend.elements.$window.off( 'resize' );
	}

	onDirectionArrowKeydown( event ) {
		const isRTL = elementorFrontend.config.is_rtl,
			inlineDirectionArrows = [ 'ArrowLeft', 'ArrowRight' ],
			currentKeydown = event.originalEvent.code,
			isDirectionInlineKeydown = -1 !== inlineDirectionArrows.indexOf( currentKeydown ),
			directionStart = isRTL ? 'ArrowRight' : 'ArrowLeft',
			directionEnd = isRTL ? 'ArrowLeft' : 'ArrowRight';

		if ( ! isDirectionInlineKeydown ) {
			return true;
		} else if ( directionStart === currentKeydown ) {
			this.swiper.slidePrev();
		} else if ( directionEnd === currentKeydown ) {
			this.swiper.slideNext();
		}
	}

	onFocusDisableAutoplay() {
		this.swiper.autoplay.stop();
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

	getSpaceBetween( device = null ) {
		return elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), 'image_spacing_custom', 'size', device ) || 0;
	}

	updateSpaceBetween( propertyName ) {
		const deviceMatch = propertyName.match( 'image_spacing_custom_(.*)' ),
			device = deviceMatch ? deviceMatch[ 1 ] : 'desktop',
			newSpaceBetween = this.getSpaceBetween( device );

		if ( 'desktop' !== device ) {
			this.swiper.params.breakpoints[ elementorFrontend.config.responsive.activeBreakpoints[ device ].value ].spaceBetween = newSpaceBetween;
		}

		this.swiper.params.spaceBetween = newSpaceBetween;

		this.swiper.update();
	}

	getPaginationBullets( type = 'array' ) {
		const paginationBullets = this.$element.find( this.getSettings( 'selectors' ).paginationBullet );

		return 'array' === type ? Array.from( paginationBullets ) : paginationBullets;
	}

	a11ySetWidgetAriaDetails() {
		const $widget = this.$element;

		$widget.attr( 'aria-roledescription', 'carousel' );
		$widget.attr( 'aria-label', elementorFrontend.config.i18n.a11yCarouselWrapperAriaLabel );
	}

	a11ySetPaginationTabindex() {
		const bulletClass = this.swiper?.params?.pagination.bulletClass,
			activeBulletClass = this.swiper?.params?.pagination.bulletActiveClass;

		this.getPaginationBullets().forEach( ( bullet ) => {
			if ( ! bullet.classList?.contains( activeBulletClass ) ) {
				bullet.removeAttribute( 'tabindex' );
			}
		} );

		const isDirectionInlineArrowKey = 'ArrowLeft' === event?.code || 'ArrowRight' === event?.code;

		if ( event?.target?.classList?.contains( bulletClass ) && isDirectionInlineArrowKey ) {
			this.$element.find( `.${ activeBulletClass }` ).trigger( 'focus' );
		}
	}

	getSwiperWrapperTranformXValue() {
		let transformValue = this.elements.$swiperWrapper[ 0 ]?.style.transform;
		transformValue = transformValue.replace( 'translate3d(', '' );
		transformValue = transformValue.split( ',' );
		transformValue = parseInt( transformValue[ 0 ].replace( 'px', '' ) );

		return !! transformValue ? transformValue : 0;
	}

	a11ySetSlideAriaHidden( status = '' ) {
		const currentIndex = 'initialisation' === status ? 0 : this.swiper?.activeIndex;

		if ( 'number' !== typeof currentIndex ) {
			return;
		}

		const swiperWrapperTransformXValue = this.getSwiperWrapperTranformXValue(),
			swiperWrapperWidth = this.elements.$swiperWrapper[ 0 ].clientWidth,
			$slides = this.elements.$swiperContainer.find( this.getSettings( 'selectors' ).slideContent );

		$slides.each( ( index, slide ) => {
			const isSlideInsideWrapper = 0 <= ( slide.offsetLeft + swiperWrapperTransformXValue ) && ( swiperWrapperWidth > ( slide.offsetLeft + swiperWrapperTransformXValue ) );

			if ( ! isSlideInsideWrapper ) {
				slide.setAttribute( 'aria-hidden', true );
				slide.setAttribute( 'inert', '' );
			} else {
				slide.removeAttribute( 'aria-hidden' );
				slide.removeAttribute( 'inert' );
			}
		} );
	}

	// Empty method which can be overwritten by child methods.
	handleElementHandlers() {}
}
