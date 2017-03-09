var Debug = function() {
	var self = this,
		errorStack = [],
		settings = {},
		elements = {};

	var initSettings = function() {
		settings = {
			debounceDelay: 500,
			urlsToWatch: [
				'elementor/assets'
			]
		};
	};

	var initElements = function() {
		elements.$window = jQuery( window );
	};

	var onError = function( event ) {
		var originalEvent = event.originalEvent,
			isInWatchList = false,
			urlsToWatch = settings.urlsToWatch;

		jQuery.each( urlsToWatch, function() {
			if ( -1 !== originalEvent.error.stack.indexOf( this ) ) {
				isInWatchList = true;

				return false;
			}
		} );

		if ( ! isInWatchList ) {
			return;
		}

		self.addError( originalEvent.message, originalEvent.filename, originalEvent.lineno, originalEvent.colno );
	};

	var bindEvents = function() {
		elements.$window.on( 'error', onError );
	};

	var init = function() {
		initSettings();

		initElements();

		bindEvents();

		self.sendErrors = _.debounce( self.sendErrors, settings.debounceDelay );
	};

	this.addCustomError = function( error ) {
		var errorInfo = error.stack.match( /\n {4}at (.*?(?=:(\d+):(\d+)))/ );

		this.addError( error.message, errorInfo[1], errorInfo[2], errorInfo[3], { custom: 'Yes' } );
	};

	this.addError = function( message, url, line, column, custom ) {
		errorStack.push( {
			date: Math.floor( new Date().getTime() / 1000 ),
			message: message,
			url:url,
			line: line,
			column: column,
			custom: custom
		} );

		self.sendErrors();
	};

	this.sendErrors = function() {
		// Avoid recursions on errors in ajax
		elements.$window.off( 'error', onError );

		jQuery.ajax( {
			url: ajaxurl,
			method: 'POST',
			data: {
				action: 'elementor_debug_log',
				data: errorStack
			},
			success: function() {
				errorStack = [];

				// Restore error handler
				elements.$window.on( 'error', onError );
			}
		} );
	};

	init();
};

module.exports = new Debug();
