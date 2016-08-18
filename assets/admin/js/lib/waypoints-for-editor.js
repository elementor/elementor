(function( $ ) {
	$.fn.waypoint = function(callback) {
		if ( typeof callback === 'function' ) {
			callback.call( this );
		}
	};
})( jQuery );
