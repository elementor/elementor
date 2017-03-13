module.exports = function( $scope, $ ) {
	var $swiper = $scope.find( '.swiper-container' );
	if ( ! $swiper.length ) {
		return;
	}

	var savedOptions = $swiper.data( 'slider_options' );
    var mySwiper = new Swiper( $swiper, savedOptions );
};
