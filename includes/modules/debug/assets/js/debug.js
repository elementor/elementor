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

		self.addError( {
			type: error.name,
			message: error.message,
			url: originalEvent.filename,
			line: originalEvent.lineno,
			column: originalEvent.colno
		} );
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
		var errorInfo = {
			type: error.name,
			url: error.fileName || error.sourceURL,
			line: error.lineNumber || error.line,
			column: error.columnNumber || error.column
		};

		if ( ! errorInfo.url ) {
			var stackInfo =  error.stack.match( /\n {4}at (.*?(?=:(\d+):(\d+)))/ );

			if ( stackInfo ) {
				errorInfo = {
					url: stackInfo[1],
					line: stackInfo[2],
					column: stackInfo[3]
				};
			}
		}

		this.addError( error.message, errorInfo.url, errorInfo.line, errorInfo.column, { custom: 'Yes' } );
	};

	this.addError = function( message, url, line, column, custom ) {
		errorStack.push( {
			type: 'Error',
			date: Math.floor( new Date().getTime() / 1000 ),
			message: message,
			url: url,
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
			url: ElementorConfig.ajaxurl,
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
