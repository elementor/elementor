import SwiperHandlerBase from './base-swiper';

export default class CarouselHandlerBase extends SwiperHandlerBase {
	constructor( ...args ) {
		super( ...args );

		this.a11yWidgetAccessedByTabKey = null;
	}

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
				swiperPlayButton: '.e-play-button',
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
				$swiperPlayButton: this.$element.find( selectors.swiperPlayButton ),
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
					return `<span class="${ classname }" data-bullet-index="${ index }"></span>`;
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
			prevSlideMessage: __( 'Previous slide', 'elementor' ),
			nextSlideMessage: __( 'Next slide', 'elementor' ),
			firstSlideMessage: __( 'This is the first slide', 'elementor' ),
			lastSlideMessage: __( 'This is the last slide', 'elementor' ),
			paginationBulletMessage: `${ __( 'Go to slide', 'elementor' ) } {{index}}`,
		};

		swiperOptions.on = {
			slideChangeTransitionEnd: () => {
				this.a11ySetSlideAriaHidden();
			},
			slideChange: () => {
				this.a11ySetPaginationTabindex();
				this.handleElementHandlers();
			},
		};

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

		this.a11ySetWidgetAriaDetails();
		this.a11ySetPaginationTabindex();
		this.a11ySetSlideAriaHidden( 'initialisation' );
	}

	bindEvents() {
		this.elements.$swiperArrows.on( 'keydown', this.onDirectionArrowKeydown.bind( this ) );
		this.elements.$paginationWrapper.on( 'keydown', '.swiper-pagination-bullet', this.onDirectionArrowKeydown.bind( this ) );
		this.elements.$swiperContainer.on( 'keydown', '.swiper-slide', this.onDirectionArrowKeydown.bind( this ) );
		this.elements.$swiperPlayButton.on( 'click', this.onClickPlayButton.bind( this ) );
		this.elements.$swiperPlayButton.on( 'focus', this.onFocusPlayButton.bind( this ) );
	}

	unbindEvents() {
		this.elements.$swiperArrows.off();
		this.elements.$paginationWrapper.off();
		this.elements.$swiperContainer.off();
		this.elements.$swiperPlayButton.off();
	}

	onDirectionArrowKeydown( event ) {
		const isRTL = elementorCommon.config.isRTL,
			inlineDirectionArrows = [ 'ArrowLeft', 'ArrowRight' ],
			currentKeydown = event.originalEvent.code,
			isInlineDirectionKeydown = -1 !== inlineDirectionArrows.indexOf( currentKeydown ),
			directionStart = isRTL ? 'ArrowRight' : 'ArrowLeft',
			directionEnd = isRTL ? 'ArrowLeft' : 'ArrowRight';

		if ( ! isInlineDirectionKeydown ) {
			return true;
		} else if ( directionStart === currentKeydown ) {
			this.swiper.slidePrev();
		} else if ( directionEnd === currentKeydown ) {
			this.swiper.slideNext();
		}
	}

	onClickPlayButton() {
		const buttonElement = event.currentTarget,
			isActive = buttonElement.classList.contains( 'e-active' );

		if ( isActive ) {
			buttonElement.classList.remove( 'e-active' );
			this.swiper.autoplay.stop();
			this.elements.$swiperWrapper.attr( 'aria-live', 'polite' );
		} else {
			buttonElement.classList.add( 'e-active' );
			this.swiper.autoplay.start();
			this.elements.$swiperWrapper.attr( 'aria-live', 'off' );
		}
	}

	onFocusPlayButton() {
		if ( ! this.a11yWidgetAccessedByTabKey ) {
			this.onClickPlayButton();
		}

		this.a11yWidgetAccessedByTabKey = true;
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

	getPaginationBullets( array = true ) {
		const paginationBullets = this.$element.find( this.getSettings( 'selectors' ).paginationBullet );

		return array ? Array.from( paginationBullets ) : paginationBullets;
	}

	a11ySetWidgetAriaDetails() {
		if ( ! elementorFrontend.isEditMode() ) {
			return;
		}

		const $widget = this.$element;

		$widget.attr( 'aria-roledescription', 'carousel' );
		$widget.attr( 'aria-label', __( 'Horizontal scrolling: ArrowLeft/Right', 'elementor' ) );
	}

	a11ySetPaginationTabindex() {
		this.getPaginationBullets().forEach( ( bullet ) => {
			if ( ! bullet.classList.contains( 'swiper-pagination-bullet-active' ) ) {
				bullet.removeAttribute( 'tabindex' );
			}
		} );

		const isHorizontalArrowKey = 'ArrowLeft' === event?.code || 'ArrowRight' === event?.code;

		if ( event?.target.classList.contains( 'swiper-pagination-bullet' ) && isHorizontalArrowKey ) {
			this.$element.find( '.swiper-pagination-bullet-active' ).trigger( 'focus' );
		}
	}

	a11ySetSlideAriaHidden( status = '' ) {
		const currentIndex = 'initialisation' === status ? 0 : this.swiper?.activeIndex;

		if ( 'number' !== typeof currentIndex ) {
			return;
		}

		let swiperWrapperTransform = this.elements.$swiperWrapper[ 0 ]?.style.transform;
		swiperWrapperTransform = swiperWrapperTransform.replace( 'translate3d(', '' );
		swiperWrapperTransform = swiperWrapperTransform.split( ',' );
		swiperWrapperTransform = parseInt( swiperWrapperTransform[ 0 ].replace( 'px', '' ) );
		swiperWrapperTransform = !! swiperWrapperTransform ? swiperWrapperTransform : 0;

		const swiperWrapperWidth = this.elements.$swiperWrapper[ 0 ].clientWidth,
			$slides = this.elements.$swiperContainer.find( this.getSettings( 'selectors' ).slideContent );

		$slides.each( ( index, slide ) => {
			const isSlideInsideWrapper = 0 <= ( slide.offsetLeft + swiperWrapperTransform ) && ( swiperWrapperWidth > ( slide.offsetLeft + swiperWrapperTransform ) );

			if ( ! isSlideInsideWrapper ) {
				slide.setAttribute( 'aria-hidden', true );
				slide.setAttribute( 'inert', '' );
			} else {
				slide.removeAttribute( 'aria-hidden' );
				slide.removeAttribute( 'inert' );
			}
		} );
	}

	handleElementHandlers() {}
}
