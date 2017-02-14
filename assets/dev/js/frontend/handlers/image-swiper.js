module.exports = function( $scope, $ ) {
	var $swiper = $scope.find( '.swiper-container' );
	if ( ! $swiper.length ) {
		return;
	}

	var savedOptions = $swiper.data( 'slider_options' );
    var mySwiper = new Swiper( $swiper, savedOptions );
/*
	var	tabletSlides = 1 === savedOptions.slidesToShow ? 1 : 2,
		defaultOptions = {
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
		},

		slickOptions = $.extend( {}, defaultOptions, $swiper.data( 'slider_options' ) );

	$swiper.slick( slickOptions );
*/
};
