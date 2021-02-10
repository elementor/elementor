// Moved from assets/dev/js/editor/utils
var Debug = function() {
	var self = this,
		errorStack = [],
		settings = {},
		elements = {};

	var initSettings = function() {
		settings = {
			debounceDelay: 500,
			urlsToWatch: [
				'elementor/assets',
			],
		};
	};

	var initElements = function() {
		elements.$window = jQuery( window );
	};

	var onError = function( event ) {
		const error = event.originalEvent?.error;
		if ( ! error ) {
			return;
		}

		var isInWatchList = false,
			urlsToWatch = settings.urlsToWatch;

		jQuery.each( urlsToWatch, function() {
			if ( -1 !== error.stack.indexOf( this ) ) {
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
			column: originalEvent.colno,
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

	this.addURLToWatch = function( url ) {
		settings.urlsToWatch.push( url );
	};

	this.addCustomError = function( error, category, tag ) {
		var errorInfo = {
			type: error.name,
			message: error.message,
			url: error.fileName || error.sourceURL,
			line: error.lineNumber || error.line,
			column: error.columnNumber || error.column,
			customFields: {
				category: category || 'general',
				tag: tag,
			},
		};

		if ( ! errorInfo.url ) {
			var stackInfo = error.stack.match( /\n {4}at (.*?(?=:(\d+):(\d+)))/ );

			if ( stackInfo ) {
				errorInfo.url = stackInfo[ 1 ];
				errorInfo.line = stackInfo[ 2 ];
				errorInfo.column = stackInfo[ 3 ];
			}
		}

		this.addError( errorInfo );
	};

	this.addError = function( errorParams ) {
		var defaultParams = {
			type: 'Error',
			timestamp: Math.floor( new Date().getTime() / 1000 ),
			message: null,
			url: null,
			line: null,
			column: null,
			customFields: {},
		};

		errorStack.push( jQuery.extend( true, defaultParams, errorParams ) );

		self.sendErrors();
	};

	this.sendErrors = function() {
		// Avoid recursions on errors in ajax
		elements.$window.off( 'error', onError );

		jQuery.ajax( {
			url: elementorCommon.config.ajax.url,
			method: 'POST',
			data: {
				action: 'elementor_js_log',
				_nonce: elementorCommon.ajax.getSettings( 'nonce' ),
				data: errorStack,
			},
			success: function() {
				errorStack = [];

				// Restore error handler
				elements.$window.on( 'error', onError );
			},
		} );
	};

	init();
};

module.exports = Debug;
