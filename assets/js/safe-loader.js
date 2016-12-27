(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
( function() {
	var SafeLoader = function() {
		var loadErrors = [];

		this.load = function( callback ) {
			try {
				callback();
			} catch ( e ) {
				loadErrors.push( e );
			}
		};

		var popErrors = function() {
			if ( ! loadErrors.length ) {
				return;
			}

			var message = [];

			for ( var error in loadErrors ) {
				var errorMessage = loadErrors[ error ].message;

				if ( -1 === message.indexOf( errorMessage ) ) {
					message.push( errorMessage );
				}
			}

			alert( 'Elementor could not be loaded due the following errors:\n\n' + message.join( '.\n\n' ) + '.' );
		};

		setTimeout( popErrors, 2000 );
	};

	window.safeLoader = new SafeLoader();
} )();

},{}]},{},[1])
//# sourceMappingURL=safe-loader.js.map
