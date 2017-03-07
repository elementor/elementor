var DebuggerModule = elementorFrontend.Module.extend( {
	errorStack: [],
	debounceSendErrors: null,

	getDefaultSettings: function() {
		return {
			debounceDelay: 1000,
			urlsToWatch: [
				'elementor/assets'
			]
		};
	},

	addError: function( message, url, line, column, error ) {
		this.errorStack.push( {
			date: new Date().getTime(),
			message: message,
			url:url,
			line: line,
			column: column,
			error: error
		} );

		this.debounceSendErrors();
	},

	onError: function( message, url, line, column, error ) {
		var isInWatchList = false,
			urlsToWatch = this.getSettings( 'urlsToWatch' );

		for ( var urlIndex in urlsToWatch ) {
			if ( -1 !== url.indexOf( urlsToWatch[ urlIndex ] ) ) {
				isInWatchList = true;
			}
		}

		if ( ! isInWatchList ) {
			return;
		}

		this.addError( message, url, line, column, error );
	},

	bindEvents: function() {
		window.onerror = this.onError;
	},

	sendErrors: function() {

		// Avoid recursions on errors in ajax
		var self = this,
			oldErrorHandler = window.onerror;
		window.onerror = null;

		elementor.ajax.send( 'debugger_log', {
			data: {
				data: JSON.stringify( this.errorStack ),
				_nonce: elementor.config.nonce
			},
			success: function() {
				self.errorStack = [];

				// Restore error handler
				window.onerror = oldErrorHandler;
			}
		} );
	},

	onInit: function() {
		elementorFrontend.Module.prototype.onInit.apply( this, arguments );
		this.debounceSendErrors = _.debounce( this.sendErrors, this.getSettings( 'debounceDelay' ) );
	}
} );

module.exports = new DebuggerModule();
