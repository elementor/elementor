import SwiperHandlerBase from './base-swiper';

export default class CarouselHandlerBase extends SwiperHandlerBase {
	getDefaultSettings() {
		return {
			selectors: {
				carousel: `.${ elementorFrontend.config.swiperClass }`,
				swiperWrapper: '.swiper-wrapper',
				slideContent: '.swiper-slide',
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
			keyboard: true,
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

		if ( !! elementSettings.a11y_pagination_previous_slide ) {
			swiperOptions.a11y = {
				enabled: true,
				prevSlideMessage: elementSettings.a11y_pagination_previous_slide,
				nextSlideMessage: elementSettings.a11y_pagination_next_slide,
				firstSlideMessage: elementSettings.a11y_pagination_first_slide,
				lastSlideMessage: elementSettings.a11y_pagination_last_slide,
				paginationBulletMessage: `${ elementSettings.a11y_pagination_bullet_message } {{index}}`,
			};
		}

		swiperOptions.on = {
			slideChangeTransitionEnd: () => {
				this.a11ySetSlideAriaHidden();
			},
			slideChange: () => {
				if ( ! this.swiper ) {
					return;
				}

				this.a11ySetPaginationTabindex();
			},
			keyPress: ( keyCode ) => {
				switch ( keyCode ) {
					case 38:
						this.swiper.slidePrev();
						break;
					case 40:
						this.swiper.slideNext();
						break;
				}
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

		this.a11ySetPaginationTabindex();
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

	a11ySetSlideAriaHidden() {
		const currentIndex = this.swiper?.activeIndex;

		if ( ! currentIndex ) {
			return;
		}

		let swiperWrapperTransform = this.elements.$swiperWrapper[ 0 ]?.style.transform;
		swiperWrapperTransform = swiperWrapperTransform.replace( 'translate3d(', '' );
		swiperWrapperTransform = swiperWrapperTransform.split( ',' );
		swiperWrapperTransform = parseInt( swiperWrapperTransform[ 0 ].replace( 'px', '' ) );

		const swiperWrapperWidth = this.elements.$swiperWrapper[ 0 ].clientWidth,
			slides = Array.from( this.elements.$slides );

		slides.forEach( ( slide, index ) => {
			const slideWidth = slide.clientWidth;

			if ( 0 >= ( slide.offsetLeft + swiperWrapperTransform ) || ( swiperWrapperWidth ) <= ( slide.offsetLeft + swiperWrapperTransform ) ) {
				slide.setAttribute( 'aria-hidden', true );
			} else {
				slide.setAttribute( 'aria-hidden', false );
			}
		} );
	}
}
