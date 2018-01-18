var Module = function() {
	var self = this;

	var init = function() {
		elementor.saver.on( 'before:save', onBeforeSave.bind( this ) );
	};

	var onBeforeSave = function( options ) {
		if ( 'autosave' === options.status ) {
			return;
		}

		var $elementor = elementorFrontend.getElements( '$elementor' );

		$elementor
			.find( '.elementor-element-overlay, .elementor-background-video-container, .elementor-widget-empty, #elementor-add-new-section' )
			.attr( 'data-html2canvas-ignore', 'true' );

		html2canvas( $elementor[0], {
			dpi:144,
			logging: false
		} ).then( function( canvas ) {
			var cropCanvas = document.createElement( 'canvas' ),
				cropContext = cropCanvas.getContext( '2d' ),
				ratio = 250 / canvas.width;

			cropCanvas.width = 250;
			cropCanvas.height = 350;

			cropContext.drawImage( canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width * ratio, canvas.height * ratio );

			elementor.ajax.addRequest( 'save_screenshot', {
				data: {
					post_id: elementor.config.post_id,
					screenshot: cropCanvas.toDataURL( 'image/png' )
				}
			} );
		} );
	};

	jQuery( window ).on( 'elementor:init', init );
};

module.exports = new Module();