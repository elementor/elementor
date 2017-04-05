var HandlerModule = require( 'elementor-frontend/handler-module' ),
	ImageCarouselHandler;

ImageCarouselHandler = HandlerModule.extend( {
	getDefaultSettings: function() {
		return {
			selectors: {
				carousel: '.elementor-image-carousel'
			}
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' );

		return {
			$carousel: this.$element.find( selectors.carousel )
		};
	},

	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		var elementSettings = this.getElementSettings(),
			slidesToShow = +elementSettings.slides_to_show,
			isSingleSlide = 1 === slidesToShow,
			tabletSlides = +elementSettings.slides_to_show_tablet || ( isSingleSlide ? 1 : 2 );

		var slickOptions = {
			slidesToShow: slidesToShow,
			autoplay: !! elementSettings.autoplay,
			autoplaySpeed: elementSettings.autoplay_speed,
			infinite: !! elementSettings.infinite,
			pauseOnHover: !! elementSettings.pause_on_hover,
			speed: elementSettings.speed,
			arrows: 'dots' !== elementSettings.navigation,
			dots: 'arrows' !== elementSettings.navigation,
			rtl: 'rtl' === elementSettings.direction,
			responsive: [
				{
					breakpoint: 767,
					settings: {
						slidesToShow: tabletSlides,
						slidesToScroll: 1
					}
				},
				{
					breakpoint: 480,
					settings: {
						slidesToShow: +elementSettings.slides_to_show_mobile || 1,
						slidesToScroll: 1
					}
				}
			]
		};

		if ( isSingleSlide ) {
			slickOptions.fade = 'fade' === elementSettings.effect;
		} else {
			slickOptions.slidesToScroll = +elementSettings.slides_to_scroll;
		}

		this.elements.$carousel.slick( slickOptions );
	}
} );

module.exports = function( $scope ) {
	new ImageCarouselHandler( { $element: $scope } );
};
