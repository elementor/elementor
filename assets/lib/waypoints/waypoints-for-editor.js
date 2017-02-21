(function( $ ) {
	$.fn.elementorWaypoint = function(callback) {
		if ( typeof callback === 'function' ) {
			callback.call( this );
		}
	};
})( jQuery );
