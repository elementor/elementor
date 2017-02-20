var Utils;

Utils = function( $ ) {
	var self = this;

	// FIXME: Choose other variable name for this flag
	var isYTInserted = false;

	var insertYTApi = function() {
		isYTInserted = true;

		$( 'script:first' ).before(  $( '<script>', { src: 'https://www.youtube.com/iframe_api' } ) );
	};

	this.onYoutubeApiReady = function( callback ) {
		if ( ! isYTInserted ) {
			insertYTApi();
		}

		if ( window.YT && YT.loaded ) {
			callback( YT );
		} else {
			// If not ready check again by timeout..
			setTimeout( function() {
				self.onYoutubeApiReady( callback );
			}, 350 );
		}
	};

	this.waypoint = function( $element, callback, options ) {
		var correctCallback = function() {
			var element = this.element || this;

			return callback.apply( element, arguments );
		};

		$element.elementorWaypoint( correctCallback, options );
	};
};

module.exports = Utils;
