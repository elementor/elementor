var Ajax;

Ajax = {
	config: {},

	initConfig: function() {
		this.config = {
			ajaxParams: {
				type: 'POST',
				url: elementor.config.ajaxurl,
				data: {}
			},
			actionPrefix: 'elementor_'
		};
	},

	init: function() {
		this.initConfig();
	},

	send: function( action, options ) {
		var self = this,
			ajaxParams = elementor.helpers.cloneObject( this.config.ajaxParams );

		options = options || {};

		action = this.config.actionPrefix + action;

		jQuery.extend( ajaxParams, options );

		if ( ajaxParams.data instanceof FormData ) {
			ajaxParams.data.append( 'action', action );
			ajaxParams.data.append( '_nonce', elementor.config.nonce );
		} else {
			ajaxParams.data.action = action;
			ajaxParams.data._nonce = elementor.config.nonce;
		}

		var successCallback = ajaxParams.success,
			errorCallback = ajaxParams.error;

		if ( successCallback || errorCallback ) {
			ajaxParams.success = function( response ) {
				if ( response.success && successCallback ) {
					successCallback( response.data );
				}

				if ( ( ! response.success ) && errorCallback ) {
					errorCallback( response.data );
				}
			};

			if ( errorCallback ) {
				ajaxParams.error = function( data ) {
					errorCallback( data );
				};
			} else {
				ajaxParams.error = function( XMLHttpRequest ) {
					if ( 0 === XMLHttpRequest.readyState && 'abort' === XMLHttpRequest.statusText ) {
						return;
					}

					var message = self.createErrorMessage( XMLHttpRequest );

					elementor.notifications.showToast( {
						message: message
					} );
				};
			}
		}

		return jQuery.ajax( ajaxParams );
	},

	createErrorMessage: function( XMLHttpRequest ) {
		var message;
		if ( 4 === XMLHttpRequest.readyState ) {
			message = elementor.translate( 'server_error' );
			if ( 200 !== XMLHttpRequest.status ) {
				message += ' (' + XMLHttpRequest.status + ' ' + XMLHttpRequest.statusText + ')';
			}
		} else if ( 0 === XMLHttpRequest.readyState ) {
			message = elementor.translate( 'server_connection_lost' );
		} else {
			message = elementor.translate( 'unknown_error' );
		}

		return message + '.';
	}
};

module.exports = Ajax;
