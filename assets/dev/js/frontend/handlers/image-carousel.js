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
			isSingleSlide = 1 === +elementSettings.slides_to_show,
			tabletSlides = isSingleSlide ? 1 : 2,
			slickOptions = {
				slidesToShow: +elementSettings.slides_to_show,
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
							slidesToScroll: tabletSlides
						}
					},
					{
						breakpoint: 480,
						settings: {
							slidesToShow: 1,
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
