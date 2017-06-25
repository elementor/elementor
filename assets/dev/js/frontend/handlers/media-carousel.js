var HandlerModule = require( 'elementor-frontend/handler-module' ),
	MediaCarousel;

MediaCarousel = HandlerModule.extend( {
	swipers: {},

	getDefaultSettings: function() {
		return {
			selectors: {
				mainSwiper: '.elementor-main-swiper',
				thumbsSwiper: '.elementor-thumbs-swiper',
				swiperSlide: '.swiper-slide',
				activeSlide: '.swiper-slide-active',
				prevSlide: '.swiper-slide-prev',
				nextSlide: '.swiper-slide-next',
				playIcon: '.elementor-custom-embed-play'
			},
			classes: {
				playing: 'elementor-playing',
				hidden: 'elementor-hidden'
			},
			attributes: {
				dataSlideIndex: 'swiper-slide-index'
			}
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' );

		var elements = {
			$mainSwiper: this.$element.find( selectors.mainSwiper ),
			$thumbsSwiper: this.$element.find( selectors.thumbsSwiper )
		};

		elements.$mainSwiperTemplate = elements.$mainSwiper.clone();

		elements.$mainSwiperSlides = elements.$mainSwiper.find( selectors.swiperSlide );

		return elements;
	},

	bindEvents: function() {
		this.elements.$mainSwiper.on( 'click', this.getSettings( 'selectors.swiperSlide' ), this.openLightBox );
	},

	getLightBox: function() {
		return elementorFrontend.utils.lightbox;
	},

	openLightBox: function( event ) {
		if ( jQuery( event.target ).closest( 'a' ).length ) {
			return;
		}

		var $swiperTemplate = this.elements.$mainSwiperTemplate.clone(),
			lightBox = this.getLightBox();

		lightBox.showModal( {
			type: 'html',
			html: $swiperTemplate,
			modalOptions: {
				id: 'elementor-carousel-lightbox-' + this.getID()
			}
		} );

		this.swipers.lightbox = new Swiper( $swiperTemplate, {
				pagination: '.swiper-pagination',
				nextButton: '.elementor-swiper-button-next',
				prevButton: '.elementor-swiper-button-prev',
				paginationClickable: true,
				autoHeight: true,
				grabCursor: true,
				initialSlide: this.getSlideIndex( event.currentTarget ),
				onSlideChangeEnd: this.onSlideChange,
				runCallbacksOnInit: false,
				loop: true
			}
		);

		this.playSlideVideo();

		lightBox.getModal().refreshPosition();
	},

	getSwiper: function( swiperName ) {
		return this.swipers[ swiperName || 'main' ];
	},

	getSlide: function( slideState, swiperName ) {
		return this.getSwiper( swiperName ).slides.filter( this.getSettings( 'selectors.' + slideState + 'Slide' ) );
	},

	getSlideIndex: function( slide ) {
		return jQuery( slide ).data( this.getSettings( 'attributes.dataSlideIndex' ) );
	},

	playSlideVideo: function() {
		var selectors = this.getSettings( 'selectors' ),
			$activeSlide = this.getSlide( 'active', 'lightbox' ),
			videoURL = $activeSlide.data( 'video-url' );

		if ( ! videoURL ) {
			return;
		}

		var classes = this.getSettings( 'classes' );

		var $videoFrame = jQuery( '<iframe>', { src: videoURL } ),
			$playIcon = $activeSlide.children( selectors.playIcon );

		$activeSlide.addClass( 'elementor-video-wrapper' ).append( $videoFrame );

		$playIcon.addClass( classes.playing ).removeClass( classes.hidden );

		$videoFrame.on( 'load', function() {
			$playIcon.addClass( classes.hidden );
		} );
	},

	onSlideChange: function() {
		var selectors = this.getSettings( 'selectors' ),
			$prevSlide = this.getSlide( 'prev', 'lightbox' ),
			$nextSlide = this.getSlide( 'next', 'lightbox' );

		this.playSlideVideo();

		$prevSlide.add( $nextSlide ).find( 'iframe' ).remove();
	},

	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		var elementSettings = this.getElementSettings(),
			slidesCount = this.elements.$mainSwiperSlides.length,
			slidesPerView = Math.min( slidesCount, +elementSettings.slides_per_view || 3 ),
			initialSlide = Math.floor( ( slidesCount - 1 ) / 2 );

		var tabletSlidesPerView = +elementSettings.slides_per_view_tablet;

		if ( ! tabletSlidesPerView ) {
			if ( 'coverflow' === elementSettings.effect ) {
				tabletSlidesPerView = 3;
			} else {
				tabletSlidesPerView = Math.min( slidesCount, 2 );
			}
		}

		var mainSwiperOptions = {
			pagination: '.swiper-pagination',
			nextButton: '.elementor-swiper-button-next',
			prevButton: '.elementor-swiper-button-prev',
			paginationClickable: true,
			grabCursor: true,
			initialSlide: initialSlide,
			slidesPerView: slidesPerView,
			spaceBetween: 20,
			paginationType: elementSettings.pagination,
			autoplay: elementSettings.autoplay_speed,
			autoplayDisableOnInteraction: !! elementSettings.pause_on_interaction,
			loop: true,
			speed: elementSettings.speed,
			centeredSlides: !! elementSettings.thumbnails,
			effect: elementSettings.effect,
			breakpoints: {
				768: {
					slidesPerView: tabletSlidesPerView,
					spaceBetween: 20
				},
				480: {
					slidesPerView: +elementSettings.slides_per_view_mobile || 1,
					spaceBetween: 10
				}
			}
		};

		this.swipers.main = new Swiper( this.elements.$mainSwiper, mainSwiperOptions );
	},

	onElementChange: function( propertyName ) {
		if ( -1 !== [ 'lightbox_content_width' ].indexOf( propertyName ) ) {
			this.getLightBox().getModal().refreshPosition();

			this.swipers.lightbox.update( true );
		}
	}
} );

module.exports = function( $scope ) {
	window.carousel = new MediaCarousel( { $element: $scope } );
};
