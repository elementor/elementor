export default class Ajax {
	initConfig() {
		this.config = {
			ajaxParams: {
				type: 'POST',
				url: elementorCommon.config.urls.ajax,
				data: {},
			},
			actionPrefix: 'elementor_',
		};
	}

	constructor() {
		this.requests = {};

		this.cache = {};

		this.initConfig();

		this.debounceSendBatch = _.debounce( this.sendBatch.bind( this ), 500 );
	}

	getCacheKey( request ) {
		return JSON.stringify( {
			unique_id: request.unique_id,
			data: request.data,
		} );
	}

	loadObjects( options ) {
		let dataCollection = {};

		const deferredArray = [];

		if ( options.before ) {
			options.before();
		}

		options.ids.forEach( objectId => {
			deferredArray.push(
				this.load( {
						action: options.action,
						unique_id: options.data.unique_id + objectId,
						data: jQuery.extend( { id: objectId }, options.data ),
					} )
					.done( data => dataCollection = jQuery.extend( dataCollection, data ) )
			);
		} );

		jQuery.when.apply( jQuery, deferredArray ).done( () => options.success( dataCollection ) );
	}

	load( request ) {
		if ( ! request.unique_id ) {
			request.unique_id = request.action;
		}

		if ( request.before ) {
			request.before();
		}

		let deferred;

		const cacheKey = this.getCacheKey( request );

		if ( _.has( this.cache, cacheKey ) ) {
			deferred = jQuery.Deferred()
				.done( request.success )
				.resolve( this.cache[ cacheKey ] );
		} else {
			deferred = this.addRequest( request.action, {
				data: request.data,
				unique_id: request.unique_id,
				success: data => this.cache[ cacheKey ] = data,
			} ).done( request.success );
		}

		return deferred;
	}

	addRequest( action, options, immediately ) {
		options = options || {};

		if ( ! options.unique_id ) {
			options.unique_id = action;
		}

		options.deferred = jQuery.Deferred().done( options.success ).fail( options.error ).always( options.complete );

		const request = {
			action: action,
			options: options,
		};

		if ( immediately ) {
			const requests = {};

			requests[ options.unique_id ] = request;

			options.deferred.jqXhr = this.sendBatch( requests );
		} else {
			this.requests[ options.unique_id ] = request;

			this.debounceSendBatch();
		}

		return options.deferred;
	}

	sendBatch( requests ) {
		const actions = {};

		if ( ! requests ) {
			requests = this.requests;

			// Empty for next batch.
			this.requests = {};
		}

		Object.entries( requests ).forEach( ( [ id, request ] ) => actions[ id ] = {
			action: request.action,
			data: request.options.data,
		} );

		return this.send( 'ajax', {
			data: {
				actions: JSON.stringify( actions ),
			},
			success: data => {
				Object.entries( data.responses ).forEach( ( [ id, response ] ) => {
					const options = requests[ id ].options;

					if ( options ) {
						if ( response.success ) {
							options.deferred.resolve( response.data );
						} else if ( ! response.success ) {
							options.deferred.reject( response.data );
						}
					}
				} );
			},
			error: data =>
				Object.values( requests ).forEach( args => {
					if ( args.options ) {
						args.options.deferred.reject( data );
					}
				} ),
		} );
	}

	send( action, options ) {
		const ajaxParams = elementorCommon.helpers.cloneObject( this.config.ajaxParams );

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

		const successCallback = ajaxParams.success,
			errorCallback = ajaxParams.error;

		if ( successCallback || errorCallback ) {
			ajaxParams.success = response => {
				if ( response.success && successCallback ) {
					successCallback( response.data );
				}

				if ( ( ! response.success ) && errorCallback ) {
					errorCallback( response.data );
				}
			};

			if ( errorCallback ) {
				ajaxParams.error = data => errorCallback( data );
			} else {
				ajaxParams.error = XMLHttpRequest => {
					if ( 0 === XMLHttpRequest.readyState && 'abort' === XMLHttpRequest.statusText ) {
						return;
					}

					const message = this.createErrorMessage( XMLHttpRequest );

					elementor.notifications.showToast( {
						message: message,
					} );
				};
			}
		}

		return jQuery.ajax( ajaxParams );
	}

	createErrorMessage( XMLHttpRequest ) {
		let message;

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
}
