module.exports = function( $scoop, $ ) {
	var $imageOverlay = $scoop.find( '.elementor-custom-embed-image-overlay' ),
		$videoFrame = $scoop.find( 'iframe' );

	if ( ! $imageOverlay.length ) {
		return;
	}

	$imageOverlay.on( 'click', function() {
		$imageOverlay.remove();
		var newSourceUrl = $videoFrame[0].src;
		// Remove old autoplay if exists
		newSourceUrl = newSourceUrl.replace( '&autoplay=0', '' );

		$videoFrame[0].src = newSourceUrl + '&autoplay=1';
	} );
};
