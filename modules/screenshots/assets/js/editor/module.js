var Module = function() {

	var init = function() {
		elementor.saver.on( 'before:save', onBeforeSave.bind( this ) );
	};

	var onBeforeSave = function( options ) {
		if ( 'autosave' === options.status ) {
			return;
		}

		var url = elementor.config.document.urls.preview.replace( 'elementor-preview', 'elementor-screenshot' );
		var iframe = document.createElement( 'iframe' );
		iframe.src = url;
		iframe.width = '1000';
		iframe.style = 'visibable: hidden;';
		jQuery( 'body' ).append( iframe );
	};

	jQuery( window ).on( 'elementor:init', init );
};

module.exports = new Module();
