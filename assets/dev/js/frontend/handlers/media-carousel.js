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
		this.elements.$mainSwiperSlides.on( 'click', this.openLightBox );
	},

	getLightBox: function() {
		return elementorFrontend.utils.lightbox;
	},

	openLightBox: function( event ) {
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
				nextButton: '.swiper-button-next',
				prevButton: '.swiper-button-prev',
				paginationClickable: true,
				autoHeight: true,
				grabCursor: true,
				initialSlide: this.getSlideIndex( event.currentTarget ),
				onSlideChangeEnd: this.onSlideChange,
				runCallbacksOnInit: false
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

	getSlideIndex: function( slide, swiperName ) {
		return this.getSwiper( swiperName ).slides.index( slide );
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
			slidesPerView = +elementSettings.slides_per_view || 3,
			isSingleSlide = 1 === slidesPerView,
			initialSlide = Math.floor( ( this.elements.$mainSwiperSlides.length - 1 ) / 2 );

		var mainSwiperOptions = {
			pagination: '.swiper-pagination',
			nextButton: '.swiper-button-next',
			prevButton: '.swiper-button-prev',
			paginationClickable: true,
			grabCursor: true,
			initialSlide: initialSlide,
			slidesPerView: slidesPerView,
			spaceBetween: 20,
			paginationType: elementSettings.pagination_type,
			autoplay: elementSettings.autoplay_speed,
			autoplayDisableOnInteraction: !! elementSettings.pause_on_interaction,
			loop: elementSettings.loop,
			speed: elementSettings.speed,
			centeredSlides: !! elementSettings.thumbnails,
			breakpoints: {
				768: {
					slidesPerView: +elementSettings.slides_per_view_tablet || ( isSingleSlide ? 1 : 2 ),
					spaceBetween: 20
				},
				480: {
					slidesPerView: +elementSettings.slides_per_view_mobile || 1,
					spaceBetween: 10
				}
			}/*,
			autoplay: 3500,
			slidesPerView: 4,
			spaceBetween: 40,
			slidesPerView: 'auto',
			coverflow: {
				rotate: 50,
				stretch: 0,
				depth: 100,
				modifier: 1,
				slideShadows: true
			}*/
		};

		var mainSwiper = this.swipers.main = new Swiper( this.elements.$mainSwiper, mainSwiperOptions );

		if ( elementSettings.thumbnails ) {
			var thumbsSwiperOptions = {
				centeredSlides: true,
				slidesPerView: 'auto',
				slideToClickedSlide: true,
				initialSlide: initialSlide
			};

			var thumbsSwiper = this.swipers.thumbs = new Swiper( this.elements.$thumbsSwiper, thumbsSwiperOptions );

			mainSwiper.params.control = thumbsSwiper;

			thumbsSwiper.params.control = mainSwiper;
		}
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
