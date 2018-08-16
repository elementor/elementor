var Ajax;

Ajax = {
	config: {},
	requests: {},
	cache: {},

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

		this.debounceSendBatch = _.debounce( this.sendBatch.bind( this ), 500 );
	},

	getCacheKey: function( request ) {
		return JSON.stringify( {
			unique_id: request.unique_id,
			data: request.data
		} );
	},

	loadObjects: function( options ) {
		var self = this,
			dataCollection = {},
			deferredArray = [];

		if ( options.before ) {
			options.before();
		}

		options.ids.forEach( function( objectId ) {
			deferredArray.push( self.load( {
				action: options.action,
				unique_id: options.data.unique_id + objectId,
				data: jQuery.extend( { id: objectId }, options.data )
			} ).done( function( data ) {
				dataCollection = jQuery.extend( dataCollection, data );
			}) );
		} );

		jQuery.when.apply( jQuery, deferredArray ).done( function() {
			options.success( dataCollection );
		} );
	},

	load: function( request ) {
		var self = this;
		if ( ! request.unique_id ) {
			request.unique_id = request.action;
		}

		if ( request.before ) {
			request.before();
		}

		var deferred,
			cacheKey = self.getCacheKey( request );

		if ( _.has( self.cache, cacheKey ) ) {
			deferred = jQuery.Deferred()
				.done( request.success )
				.resolve( self.cache[ cacheKey ] );
		} else {
			deferred = self.addRequest( request.action, {
				data: request.data,
				unique_id: request.unique_id,
				success: function( data ) {
					self.cache[ cacheKey ] = data;
				}
			} ).done( request.success );
		}

		return deferred;
	},

	addRequest: function( action, options, immediately ) {
		options = options || {};

		if ( ! options.unique_id ) {
			options.unique_id = action;
		}

		options.deferred = jQuery.Deferred().done( options.success ).fail( options.error ).always( options.complete );

		var request = {
			action: action,
			options: options
		};

		if ( immediately ) {
			var requests = {};
			requests[ options.unique_id ] = request;
			options.deferred.jqXhr = this.sendBatch( requests );
		} else {
			this.requests[ options.unique_id ] = request;
			this.debounceSendBatch();
		}

		return options.deferred;
	},

	sendBatch: function( requests ) {
		var actions = {};

		if ( ! requests ) {
			requests = this.requests;

			// Empty for next batch.
			this.requests = {};
		}

		_( requests ).each( function( request, id ) {
			actions[ id ] = {
				action: request.action,
				data: request.options.data
			};
		} );

		return this.send( 'ajax', {
			data: {
				actions: JSON.stringify( actions )
			},
			success: function( data ) {
				_.each( data.responses, function( response, id ) {
					var options = requests[ id ].options;
					if ( options ) {
						if ( response.success ) {
							options.deferred.resolve( response.data );
						} else if ( ! response.success ) {
							options.deferred.reject( response.data );
						}
					}
				} );
			},
			error: function( data ) {
				_.each( requests, function( args ) {
					if ( args.options ) {
						args.options.deferred.reject( data );
					}
				} );
			}
		} );
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
			ajaxParams.data.append( 'editor_post_id', elementor.config.document.id );

		} else {
			ajaxParams.data.action = action;
			ajaxParams.data._nonce = elementor.config.nonce;
			ajaxParams.data.editor_post_id = elementor.config.document.id;
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
