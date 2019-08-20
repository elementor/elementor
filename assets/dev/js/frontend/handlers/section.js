class BackgroundSlideshow extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			classes: {
				swiperContainer: 'elementor-background-slideshow',
				swiperWrapper: 'swiper-wrapper',
				swiperSlide: 'elementor-background-slideshow__slide swiper-slide',
				swiperSlideInner: 'elementor-background-slideshow__slide__image',
				kenBurns: 'elementor-ken-burns',
				kenBurnsActive: 'elementor-ken-burns--active',
				kenBurnsIn: 'elementor-ken-burns--in',
				kenBurnsOut: 'elementor-ken-burns--out',
			},
		};
	}

	getSwiperOptions() {
		const elementSettings = this.getElementSettings(),
			kenBurnsActiveClass = this.getSettings( 'classes.kenBurnsActive' );

		const swiperOptions = {
			grabCursor: false,
			slidesPerView: 1,
			slidesPerGroup: 1,
			loop: 'yes' === elementSettings.background_slideshow_loop,
			speed: elementSettings.background_slideshow_animation_speed,
			autoplay: {
				delay: elementSettings.background_slideshow_autoplay_speed,
				stopOnLastSlide: ! elementSettings.background_slideshow_loop,
			},
			on: {
				slideChange: function() {
					if ( this.$activeImage ) {
						this.$activeImage.removeClass( kenBurnsActiveClass );
					}

					this.$activeImage = jQuery( this.slides[ this.activeIndex ] ).children();

					this.$activeImage.addClass( kenBurnsActiveClass );
				},
			},
		};

		if ( 'yes' === elementSettings.background_slideshow_loop ) {
			swiperOptions.loopedSlides = this.getSlidesCount();
		}

		switch ( elementSettings.background_slideshow_content_animation ) {
			case 'fade':
				swiperOptions.effect = 'fade';
				break;
			case 'slide_down':
				swiperOptions.autoplay.reverseDirection = true;
			// eslint-disable-next-line no-fallthrough
			case 'slide_up':
				swiperOptions.direction = 'vertical';
				break;
		}

		return swiperOptions;
	}

	getSlidesCount() {
		return this.elements.$slides.length;
	}

	buildSwiperElements() {
		const classes = this.getSettings( 'classes' ),
			elementSettings = this.getElementSettings(),
			direction = 'slide_left' === elementSettings.background_slideshow_content_animation ? 'ltr' : 'rtl',
			$container = jQuery( '<div>', { class: classes.swiperContainer, dir: direction } ),
			$wrapper = jQuery( '<div>', { class: classes.swiperWrapper } ),
			kenBurnsActive = elementSettings.background_slideshow_ken_burns;

		let slideInnerClass = classes.swiperSlideInner;

		if ( kenBurnsActive ) {
			slideInnerClass += ' ' + classes.kenBurns;

			const kenBurnsDirection = 'in' === elementSettings.background_slideshow_ken_burns_zoom_direction ? 'kenBurnsIn' : 'kenBurnsOut';

			slideInnerClass += ' ' + classes[ kenBurnsDirection ];
		}

		this.elements.$slides = jQuery();

		elementSettings.background_slideshow_gallery.forEach( ( slide ) => {
			const $slide = jQuery( '<div>', { class: classes.swiperSlide } ),
				$slidebg = jQuery( '<div>', {
					class: slideInnerClass,
					style: 'background-image: url("' + slide.url + '");',
				} );

			$slide.append( $slidebg );
			$wrapper.append( $slide );

			this.elements.$slides = this.elements.$slides.add( $slide );
		} );

		$container.append( $wrapper );

		this.$element.prepend( $container );

		this.elements.$backgroundSlideShowContainer = $container;
	}

	initSlider() {
		if ( 1 >= this.getSlidesCount() ) {
			return;
		}

		this.swiper = new Swiper( this.elements.$backgroundSlideShowContainer, this.getSwiperOptions() );
	}

	activate() {
		this.buildSwiperElements();

		this.initSlider();
	}

	deactivate() {
		if ( this.swiper ) {
			this.swiper.destroy();

			this.elements.$backgroundSlideShowContainer.remove();
		}
	}

	run() {
		if ( 'slideshow' === this.getElementSettings( 'background_background' ) ) {
			this.activate();
		} else {
			this.deactivate();
		}
	}

	onInit() {
		super.onInit();

		this.run();
	}

	onDestroy() {
		super.onDestroy();

		this.deactivate();
	}

	onElementChange( propertyName ) {
		if ( 'background_background' === propertyName ) {
			this.run();
		}
	}
}

class BackgroundVideo extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				backgroundVideoContainer: '.elementor-background-video-container',
				backgroundVideoEmbed: '.elementor-background-video-embed',
				backgroundVideoHosted: '.elementor-background-video-hosted',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' ),
			elements = {
				$backgroundVideoContainer: this.$element.find( selectors.backgroundVideoContainer ),
		};

		elements.$backgroundVideoEmbed = elements.$backgroundVideoContainer.children( selectors.backgroundVideoEmbed );

		elements.$backgroundVideoHosted = elements.$backgroundVideoContainer.children( selectors.backgroundVideoHosted );

		return elements;
	}

	calcVideosSize() {
		const containerWidth = this.elements.$backgroundVideoContainer.outerWidth(),
			containerHeight = this.elements.$backgroundVideoContainer.outerHeight(),
			aspectRatioSetting = '16:9', //TEMP
			aspectRatioArray = aspectRatioSetting.split( ':' ),
			aspectRatio = aspectRatioArray[ 0 ] / aspectRatioArray[ 1 ],
			ratioWidth = containerWidth / aspectRatio,
			ratioHeight = containerHeight * aspectRatio,
			isWidthFixed = containerWidth / containerHeight > aspectRatio;

		return {
			width: isWidthFixed ? containerWidth : ratioHeight,
			height: isWidthFixed ? ratioWidth : containerHeight,
		};
	}

	changeVideoSize() {
		const $video = this.isYTVideo ? jQuery( this.player.getIframe() ) : this.elements.$backgroundVideoHosted,
			size = this.calcVideosSize();

		$video.width( size.width ).height( size.height );
	}

	startVideoLoop( firstTime ) {
		// If the section has been removed
		if ( ! this.player.getIframe().contentWindow ) {
			return;
		}

		const elementSettings = this.getElementSettings(),
			startPoint = elementSettings.background_video_start || 0,
			endPoint = elementSettings.background_video_end;

		if ( elementSettings.background_play_once && ! firstTime ) {
			this.player.stopVideo();
			return;
		}

		this.player.seekTo( startPoint );

		if ( endPoint ) {
			const durationToEnd = endPoint - startPoint + 1;

			setTimeout( () => {
				this.startVideoLoop( false );
			}, durationToEnd * 1000 );
		}
	}

	prepareYTVideo( YT, videoID ) {
		const $backgroundVideoContainer = this.elements.$backgroundVideoContainer,
			elementSettings = this.getElementSettings();
		let startStateCode = YT.PlayerState.PLAYING;

		// Since version 67, Chrome doesn't fire the `PLAYING` state at start time
		if ( window.chrome ) {
			startStateCode = YT.PlayerState.UNSTARTED;
		}

		$backgroundVideoContainer.addClass( 'elementor-loading elementor-invisible' );

		this.player = new YT.Player( this.elements.$backgroundVideoEmbed[ 0 ], {
			videoId: videoID,
			events: {
				onReady: () => {
					this.player.mute();

					this.changeVideoSize();

					this.startVideoLoop( true );

					this.player.playVideo();
				},
				onStateChange: ( event ) => {
					switch ( event.data ) {
						case startStateCode:
							$backgroundVideoContainer.removeClass( 'elementor-invisible elementor-loading' );

							break;
						case YT.PlayerState.ENDED:
							this.player.seekTo( elementSettings.background_video_start || 0 );
							if ( elementSettings.background_play_once ) {
								this.player.destroy();
							}
					}
				},
			},
			playerVars: {
				controls: 0,
				rel: 0,
			},
		} );
	}

	activate() {
		let videoLink = this.getElementSettings( 'background_video_link' );
		const videoID = elementorFrontend.utils.youtube.getYoutubeIDFromURL( videoLink ),
			playOnce = this.getElementSettings( 'background_play_once' );

		this.isYTVideo = ! ! videoID;

		if ( videoID ) {
			elementorFrontend.utils.youtube.onYoutubeApiReady( ( YT ) => {
				setTimeout( () => {
					this.prepareYTVideo( YT, videoID );
				}, 0 );
			} );
		} else {
			const startTime = this.getElementSettings( 'background_video_start' ),
				endTime = this.getElementSettings( 'background_video_end' );
			if ( startTime || endTime ) {
				videoLink += '#t=' + ( startTime || 0 ) + ( endTime ? ',' + endTime : '' );
			}
			this.elements.$backgroundVideoHosted.attr( 'src', videoLink ).one( 'canplay', this.changeVideoSize.bind( this ) );
			if ( playOnce ) {
				this.elements.$backgroundVideoHosted.on( 'ended', () => {
					this.elements.$backgroundVideoHosted.hide();
				} );
			}
		}

		elementorFrontend.elements.$window.on( 'resize', this.changeVideoSize );
	}

	deactivate() {
		if ( this.isYTVideo && this.player.getIframe() ) {
			this.player.destroy();
		} else {
			this.elements.$backgroundVideoHosted.removeAttr( 'src' ).off( 'ended' );
		}

		elementorFrontend.elements.$window.off( 'resize', this.changeVideoSize );
	}

	run() {
		const elementSettings = this.getElementSettings();

		if ( ! elementSettings.background_play_on_mobile && 'mobile' === elementorFrontend.getCurrentDeviceMode() ) {
			return;
		}

		if ( 'video' === elementSettings.background_background && elementSettings.background_video_link ) {
			this.activate();
		} else {
			this.deactivate();
		}
	}

	onInit( ...args ) {
		super.onInit( ...args );

		this.changeVideoSize = this.changeVideoSize.bind( this );

		this.run();
	}

	onElementChange( propertyName ) {
		if ( 'background_background' === propertyName ) {
			this.run();
		}
	}
}

class StretchedSection extends elementorModules.frontend.handlers.Base {
	bindEvents() {
		const handlerID = this.getUniqueHandlerID();

		elementorFrontend.addListenerOnce( handlerID, 'resize', this.stretch );

		elementorFrontend.addListenerOnce( handlerID, 'sticky:stick', this.stretch, this.$element );

		elementorFrontend.addListenerOnce( handlerID, 'sticky:unstick', this.stretch, this.$element );
	}

	unbindEvents() {
		elementorFrontend.removeListeners( this.getUniqueHandlerID(), 'resize', this.stretch );
	}

	initStretch() {
		this.stretch = this.stretch.bind( this );

		this.stretchElement = new elementorModules.frontend.tools.StretchElement( {
			element: this.$element,
			selectors: {
				container: this.getStretchContainer(),
			},
		} );
	}

	getStretchContainer() {
		return elementorFrontend.getGeneralSettings( 'elementor_stretched_section_container' ) || window;
	}

	stretch() {
		if ( ! this.getElementSettings( 'stretch_section' ) ) {
			return;
		}

		this.stretchElement.stretch();
	}

	onInit( ...args ) {
		this.initStretch();

		super.onInit( ...args );

		this.stretch();
	}

	onElementChange( propertyName ) {
		if ( 'stretch_section' === propertyName ) {
			if ( this.getElementSettings( 'stretch_section' ) ) {
				this.stretch();
			} else {
				this.stretchElement.reset();
			}
		}
	}

	onGeneralSettingsChange( changed ) {
		if ( 'elementor_stretched_section_container' in changed ) {
			this.stretchElement.setSettings( 'selectors.container', this.getStretchContainer() );

			this.stretch();
		}
	}
}

class Shapes extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				container: '> .elementor-shape-%s',
			},
			svgURL: elementorFrontend.config.urls.assets + 'shapes/',
		};
	}

	getDefaultElements() {
		const elements = {},
			selectors = this.getSettings( 'selectors' );

		elements.$topContainer = this.$element.find( selectors.container.replace( '%s', 'top' ) );

		elements.$bottomContainer = this.$element.find( selectors.container.replace( '%s', 'bottom' ) );

		return elements;
	}

	getSvgURL( shapeType, fileName ) {
		let svgURL = this.getSettings( 'svgURL' ) + fileName + '.svg';
		if ( elementor.config.additional_shapes && shapeType in elementor.config.additional_shapes ) {
			svgURL = elementor.config.additional_shapes[ shapeType ];
		}
		return svgURL;
	}

	buildSVG( side ) {
		const baseSettingKey = 'shape_divider_' + side,
			shapeType = this.getElementSettings( baseSettingKey ),
			$svgContainer = this.elements[ '$' + side + 'Container' ];

		$svgContainer.attr( 'data-shape', shapeType );

		if ( ! shapeType ) {
			$svgContainer.empty(); // Shape-divider set to 'none'
			return;
		}

		let fileName = shapeType;

		if ( this.getElementSettings( baseSettingKey + '_negative' ) ) {
			fileName += '-negative';
		}

		const svgURL = this.getSvgURL( shapeType, fileName );

		jQuery.get( svgURL, ( data ) => {
			$svgContainer.empty().append( data.childNodes[ 0 ] );
		} );

		this.setNegative( side );
	}

	setNegative( side ) {
		this.elements[ '$' + side + 'Container' ].attr( 'data-negative', !! this.getElementSettings( 'shape_divider_' + side + '_negative' ) );
	}

	onInit( ...args ) {
		super.onInit( ...args );

		[ 'top', 'bottom' ].forEach( ( side ) => {
			if ( this.getElementSettings( 'shape_divider_' + side ) ) {
				this.buildSVG( side );
			}
		} );
	}

	onElementChange( propertyName ) {
		const shapeChange = propertyName.match( /^shape_divider_(top|bottom)$/ );

		if ( shapeChange ) {
			this.buildSVG( shapeChange[ 1 ] ).bind( this );

			return;
		}

		const negativeChange = propertyName.match( /^shape_divider_(top|bottom)_negative$/ );

		if ( negativeChange ) {
			this.buildSVG( negativeChange[ 1 ] ).bind( this );

			this.setNegative( negativeChange[ 1 ] );
		}
	}
}

class HandlesPosition extends elementorModules.frontend.handlers.Base {
    isFirstSection() {
		return this.$element.is( '.elementor-edit-mode .elementor-top-section:first' );
	}

	isOverflowHidden() {
		return 'hidden' === this.$element.css( 'overflow' );
	}

    getOffset() {
		if ( 'body' === elementor.config.document.container ) {
			return this.$element.offset().top;
		}

		const $container = jQuery( elementor.config.document.container );
		return this.$element.offset().top - $container.offset().top;
	}

    setHandlesPosition() {
        const isOverflowHidden = this.isOverflowHidden();

        if ( ! isOverflowHidden && ! this.isFirstSection() ) {
			return;
        }

        const offset = isOverflowHidden ? 0 : this.getOffset(),
            $handlesElement = this.$element.find( '> .elementor-element-overlay > .elementor-editor-section-settings' ),
            insideHandleClass = 'elementor-section--handles-inside';

		if ( offset < 25 ) {
            this.$element.addClass( insideHandleClass );

            if ( offset < -5 ) {
                $handlesElement.css( 'top', -offset );
            } else {
                $handlesElement.css( 'top', '' );
            }
        } else {
            this.$element.removeClass( insideHandleClass );
        }
    }

    onInit() {
        this.setHandlesPosition();

        this.$element.on( 'mouseenter', this.setHandlesPosition.bind( this ) );
    }
}

export default ( $scope ) => {
	if ( elementorFrontend.isEditMode() || $scope.hasClass( 'elementor-section-stretched' ) ) {
		elementorFrontend.elementsHandler.addHandler( StretchedSection, { $element: $scope } );
	}

	if ( elementorFrontend.isEditMode() ) {
		elementorFrontend.elementsHandler.addHandler( Shapes, { $element: $scope } );
		elementorFrontend.elementsHandler.addHandler( HandlesPosition, { $element: $scope } );
	}

	elementorFrontend.elementsHandler.addHandler( BackgroundVideo, { $element: $scope } );

	elementorFrontend.elementsHandler.addHandler( BackgroundSlideshow, { $element: $scope } );
};
