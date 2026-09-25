const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;
const RETRY_MAX_DELAY_MS = 30000;

export default class extends elementorModules.Module {
	getDefaultSettings() {
		return {
			ajaxParams: {
				type: 'POST',
				url: elementorCommon.config.ajax.url,
				data: {},
				dataType: 'json',
			},
			actionPrefix: 'elementor_',
		};
	}

	constructor( ...args ) {
		super( ...args );

		this.requests = {};

		this.cache = {};

		this.initRequestConstants();

		this.debounceSendBatch = _.debounce( this.sendBatch.bind( this ), 500 );
	}

	initRequestConstants() {
		this.requestConstants = {
			_nonce: this.getSettings( 'nonce' ),
		};
	}

	addRequestConstant( key, value ) {
		this.requestConstants[ key ] = value;
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

		options.ids.forEach( ( objectId ) => {
			deferredArray.push(
				this.load( {
					action: options.action,
					unique_id: options.data.unique_id + objectId,
					data: jQuery.extend( { id: objectId }, options.data ),
				} )
					.done( ( data ) => dataCollection = jQuery.extend( dataCollection, data ) ),
			);
		} );

		jQuery.when.apply( jQuery, deferredArray ).done( () => options.success( dataCollection ) );
	}

	load( request, immediately ) {
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
				retry: request.retry,
				success: ( data ) => this.cache[ cacheKey ] = data,
				error: request.error ?? ( () => {} ),
			}, immediately )
				.done( request.success );
		}

		return deferred;
	}

	cancelRequest( requestId ) {
		const request = this.requests[ requestId ];

		if ( ! request ) {
			return null;
		}

		if ( request.options.deferred.jqXhr ) {
			return request.options.deferred.jqXhr.abort( 'Request canceled' );
		}

		if ( request.options.deferred ) {
			return request.options.deferred.reject( 'Request canceled' );
		}
	}

	addRequest( action, options, immediately ) {
		options = options || {};

		if ( ! options.unique_id ) {
			options.unique_id = action;
		}

		options.deferred = jQuery.Deferred().done( options.success ).fail( options.error ).always( options.complete );

		const request = {
			action,
			options,
		};

		if ( immediately ) {
			const requests = {};

			requests[ options.unique_id ] = request;

			options.deferred.jqXhr = this.sendBatch( requests );
		} else {
			const pendingRequest = this.requests[ options.unique_id ];

			if ( pendingRequest ) {
				// A batch holds a single request per unique id, so without settling the displaced
				// deferred its caller would wait forever.
				if ( this.getCacheKey( pendingRequest.options ) === this.getCacheKey( options ) ) {
					pendingRequest.options.deferred
						.done( ( data ) => options.deferred.resolve( data ) )
						.fail( ( data ) => options.deferred.reject( data ) );

					return options.deferred;
				}

				pendingRequest.options.deferred.reject( 'Request replaced' );
			}

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

		const canRetry = Object.values( requests ).every( ( request ) => request.options.retry );

		Object.entries( requests ).forEach( ( [ id, request ] ) => actions[ id ] = {
			action: request.action,
			data: request.options.data,
		} );

		return this.send( 'ajax', {
			data: {
				actions: JSON.stringify( actions ),
			},
			retry: canRetry,
			success: ( data ) => {
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
			error: ( data ) =>
				Object.values( requests ).forEach( ( args ) => {
					if ( args.options ) {
						args.options.deferred.reject( data );
					}
				} ),
		} );
	}

	prepareSend( action, options ) {
		const settings = this.getSettings(),
			ajaxParams = elementorCommon.helpers.cloneObject( settings.ajaxParams );

		options = options || {};

		action = settings.actionPrefix + action;

		jQuery.extend( ajaxParams, options );

		const requestConstants = elementorCommon.helpers.cloneObject( this.requestConstants );

		requestConstants.action = action;

		const isFormData = ajaxParams.data instanceof FormData;

		Object.entries( requestConstants ).forEach( ( [ key, value ] ) => {
			if ( isFormData ) {
				ajaxParams.data.append( key, value );
			} else {
				ajaxParams.data[ key ] = value;
			}
		} );

		const successCallback = ajaxParams.success,
			errorCallback = ajaxParams.error;

		if ( successCallback || errorCallback ) {
			ajaxParams.success = ( response ) => {
				if ( response.success && successCallback ) {
					successCallback( response.data );
				}

				if ( ( ! response.success ) && errorCallback ) {
					errorCallback( response.data );
				}
			};

			if ( errorCallback ) {
				ajaxParams.error = ( data ) => errorCallback( data );
			} else {
				ajaxParams.error = ( xmlHttpRequest ) => {
					if ( xmlHttpRequest.readyState || 'abort' !== xmlHttpRequest.statusText ) {
						this.trigger( 'request:unhandledError', xmlHttpRequest );
					}
				};
			}
		}

		return ajaxParams;
	}

	send( action, options ) {
		const ajaxParams = this.prepareSend( action, options );
		const retryEnabled = true === ajaxParams.retry;

		delete ajaxParams.retry;

		let attempt = 0;
		let aborted = false;
		let settled = false;
		let jqXhr = null;
		let retryTimer = null;

		// Callers treat the return value as a jqXHR-like promise, so this deferred is
		// settled with the outcome of the final attempt to keep .done/.fail working
		// across retries.
		const deferred = jQuery.Deferred();

		const originalSuccess = ajaxParams.success;
		const originalError = ajaxParams.error;

		ajaxParams.success = ( response ) => {
			jqXhr = null;
			settled = true;

			deferred.resolve( response );

			if ( originalSuccess ) {
				originalSuccess( response );
			}
		};

		// Hosts rate-limit admin-ajax.php, and a burst of editor requests can draw HTTP
		// 429 responses that would otherwise leave components unloaded. Retry only
		// explicitly opted-in requests, since a batch may contain write actions; a 5xx
		// may follow a partial write and is never retried.
		ajaxParams.error = ( errorJqXHR, textStatus, errorThrown ) => {
			jqXhr = null;

			if ( aborted || 'abort' === textStatus || ! retryEnabled || 429 !== errorJqXHR.status || attempt >= MAX_RETRIES ) {
				settled = true;

				deferred.reject( errorJqXHR, textStatus, errorThrown );

				if ( originalError ) {
					originalError( errorJqXHR, textStatus, errorThrown );
				}

				return;
			}

			attempt += 1;

			retryTimer = setTimeout( () => {
				jqXhr = jQuery.ajax( ajaxParams );
			}, Math.min( getRetryDelayMs( errorJqXHR ), RETRY_MAX_DELAY_MS ) );
		};

		// Retry-After carries seconds or an HTTP-date; anything unparsable falls back to
		// exponential backoff. The delay is capped so a far-future header cannot freeze
		// pending editor work.
		function getRetryDelayMs( failedRequest ) {
			const header = failedRequest.getResponseHeader && failedRequest.getResponseHeader( 'Retry-After' );

			// Strict digits-only check keeps coercive junk ("0x10", "-5") out of the
			// seconds branch.
			if ( header && /^\d+(\.\d+)?$/.test( header.trim() ) ) {
				return Math.max( 0, Number( header ) * 1000 );
			}

			if ( header ) {
				const date = Date.parse( header );

				if ( ! Number.isNaN( date ) ) {
					return Math.max( 0, date - Date.now() );
				}
			}

			const backoffDelay = RETRY_BASE_DELAY_MS * Math.pow( 2, attempt - 1 );

			return backoffDelay * ( 1 + ( Math.random() * 0.2 ) );
		}

		jqXhr = jQuery.ajax( ajaxParams );

		return Object.assign( deferred.promise(), {
			abort: () => {
				if ( settled ) {
					return;
				}

				aborted = true;

				clearTimeout( retryTimer );

				if ( jqXhr ) {
					jqXhr.abort( 'Request canceled' );
				} else {
					// No request is in flight during a backoff wait, so settle the
					// callers the same way an in-flight abort would.
					const syntheticJqXHR = {
						status: 0,
						statusText: 'abort',
						readyState: 0,
						getResponseHeader: () => null,
						getAllResponseHeaders: () => '',
					};

					settled = true;

					deferred.reject( syntheticJqXHR, 'abort', 'Request canceled' );

					if ( originalError ) {
						originalError( syntheticJqXHR, 'abort', 'Request canceled' );
					}
				}
			},
		} );
	}

	addRequestCache( request, data ) {
		const cacheKey = this.getCacheKey( request );
		this.cache[ cacheKey ] = data;
	}

	invalidateCache( request ) {
		const cacheKey = this.getCacheKey( request );
		delete this.cache[ cacheKey ];
	}
}
