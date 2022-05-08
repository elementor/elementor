( function() {
	'use strict';

	var document = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};
	var isCommonjs = typeof module !== 'undefined' && module.exports;

	var fn = ( function() {
		var val;

		var fnMap = [
			[
				'requestFullscreen',
				'exitFullscreen',
				'fullscreenElement',
				'fullscreenEnabled',
				'fullscreenchange',
				'fullscreenerror',
			],
			// New WebKit
			[
				'webkitRequestFullscreen',
				'webkitExitFullscreen',
				'webkitFullscreenElement',
				'webkitFullscreenEnabled',
				'webkitfullscreenchange',
				'webkitfullscreenerror',

			],
			// Old WebKit
			[
				'webkitRequestFullScreen',
				'webkitCancelFullScreen',
				'webkitCurrentFullScreenElement',
				'webkitCancelFullScreen',
				'webkitfullscreenchange',
				'webkitfullscreenerror',

			],
			[
				'mozRequestFullScreen',
				'mozCancelFullScreen',
				'mozFullScreenElement',
				'mozFullScreenEnabled',
				'mozfullscreenchange',
				'mozfullscreenerror',
			],
			[
				'msRequestFullscreen',
				'msExitFullscreen',
				'msFullscreenElement',
				'msFullscreenEnabled',
				'MSFullscreenChange',
				'MSFullscreenError',
			],
		];

		var i = 0;
		var l = fnMap.length;
		var ret = {};

		for ( ; i < l; i++ ) {
			val = fnMap[ i ];
			if ( val && val[ 1 ] in document ) {
				var valLength = val.length;
				for ( i = 0; i < valLength; i++ ) {
					ret[ fnMap[ 0 ][ i ] ] = val[ i ];
				}
				return ret;
			}
		}

		return false;
	} )();

	var eventNameMap = {
		change: fn.fullscreenchange,
		error: fn.fullscreenerror,
	};

	var screenfull = {
		request( element ) {
			return new Promise( function( resolve, reject ) {
				var onFullScreenEntered = function() {
					this.off( 'change', onFullScreenEntered );
					resolve();
				}.bind( this );

				this.on( 'change', onFullScreenEntered );

				element = element || document.documentElement;

				Promise.resolve( element[ fn.requestFullscreen ]() ).catch( reject );
			}.bind( this ) );
		},
		exit() {
			return new Promise( function( resolve, reject ) {
				if ( ! this.isFullscreen ) {
					resolve();
					return;
				}

				var onFullScreenExit = function() {
					this.off( 'change', onFullScreenExit );
					resolve();
				}.bind( this );

				this.on( 'change', onFullScreenExit );

				Promise.resolve( document[ fn.exitFullscreen ]() ).catch( reject );
			}.bind( this ) );
		},
		toggle( element ) {
			return this.isFullscreen ? this.exit() : this.request( element );
		},
		onchange( callback ) {
			this.on( 'change', callback );
		},
		onerror( callback ) {
			this.on( 'error', callback );
		},
		on( event, callback ) {
			var eventName = eventNameMap[ event ];
			if ( eventName ) {
				document.addEventListener( eventName, callback, false );
			}
		},
		off( event, callback ) {
			var eventName = eventNameMap[ event ];
			if ( eventName ) {
				document.removeEventListener( eventName, callback, false );
			}
		},
		raw: fn,
	};

	if ( ! fn ) {
		if ( isCommonjs ) {
			module.exports = { isEnabled: false };
		} else {
			window.screenfull = { isEnabled: false };
		}

		return;
	}

	Object.defineProperties( screenfull, {
		isFullscreen: {
			get() {
				return Boolean( document[ fn.fullscreenElement ] );
			},
		},
		element: {
			enumerable: true,
			get() {
				return document[ fn.fullscreenElement ];
			},
		},
		isEnabled: {
			enumerable: true,
			get() {
				// Coerce to boolean in case of old WebKit
				return Boolean( document[ fn.fullscreenEnabled ] );
			},
		},
	} );

	if ( isCommonjs ) {
		module.exports = screenfull;
	} else {
		window.screenfull = screenfull;
	}
} )();
