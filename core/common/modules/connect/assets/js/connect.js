const Module = require( 'elementor-utils/module' );

export default class extends Module {
	addPopupPlugin() {
		( function( $ ) {
			$.fn.elementorConnect = function( options ) {
				var settings = $.extend( {
					// These are the defaults.
					callback: function() {
						location.reload();
					},
				}, options );

				this.attr( 'href', this.attr( 'href' ) + '&mode=popup' );

				jQuery( window ).on( 'elementorConnected', settings.callback );

				return this;
			};
		}( jQuery ) );
	}

	applyPopup() {
		jQuery( '.elementor-connect-popup' ).elementorConnect();
	}

	onInit() {
		this.addPopupPlugin();
		this.applyPopup();
	}
}
