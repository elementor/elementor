var Ajax;

Ajax = {
	config: {},
	requests: [],
	requestsMap: {},

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

		this.debounceSendBatch = _.debounce( _.bind( this.sendBatch, this ), 200 );
	},

	addUnique: function( action, options ) {
		if ( this.requestsMap[ action ] ) {
			this.requests[ this.requestsMap[ action ] ] = {
				action: action,
				options: options
			};
		} else {
			this.requests.push( {
				action: action,
				options: options
			} );

			this.requestsMap[ action ] = this.requests.length - 1;
		}

		this.debounceSendBatch();
	},

	add: function( action, options ) {
		this.requests.push( {
			action: action,
			options: options
		} );

		this.debounceSendBatch();
	},

	sendBatch: function() {
		var requests = this.requests,
			actions = [];

		// Empty for next batch.
		this.requests = [];

		_( requests ).each( function( request ) {
			actions.push( {
				action: request.action,
				data: request.options.data
			} );
		} );

		this.send( 'ajax', {
			data: {
				actions: actions
			},
			success: function( data ) {
				_.each( data.responses, function( response, id ) {
					var options = requests[ id ].options;
					if ( options ) {
						if ( response.success && options.success ) {
							try {
								options.success( response.data );
							} catch ( error ) {}
						} else if ( ! response.success && options.error ) {
							try {
								options.error( response.data );
							} catch ( error ) {}
						}
					}
				} );
				},
			error: function( data ) {
			}
		} );
	},

	send: function( action, options ) {
		var ajaxParams = elementor.helpers.cloneObject( this.config.ajaxParams );

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
			}
		}

		return jQuery.ajax( ajaxParams );
	}
};

module.exports = Ajax;
