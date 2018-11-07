( function( $ ) {
	$.fn.elementorConnect = function( options ) {
		var settings = $.extend( {
			// These are the defaults.
			callback: function() {
				location.reload();
			}
		}, options );

		this.attr( 'target', '_blank' );
		this.attr( 'href', this.attr( 'href' ) + '&mode=popup' );

		jQuery( window ).on( 'elementorConnected', settings.callback );

		return this;
	};

}( jQuery ) );
