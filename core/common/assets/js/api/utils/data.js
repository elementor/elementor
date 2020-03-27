// TODO: Return it from the server. Original at WP_REST_Server.
export const READABLE = [ 'GET' ],
	CREATABLE = [ 'POST' ],
	EDITABLE = [ 'POST', 'PUT', 'PATCH' ],
	DELETABLE = [ 'DELETE' ],
	ALLMETHODS = [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE' ];

export default class Data {
	constructor( args = {} ) {
		this.args = Object.assign( args, {
			namespace: 'elementor',
			version: '1',
		} );

		this.autoCache = {};

		this.baseEndpointAddress = '';

		elementorCommon.elements.$window.on( 'elementor:loaded', this.onElementorLoaded.bind( this ) );
	}

	onElementorLoaded() {
		const { namespace, version } = this.args;

		this.baseEndpointAddress = `${ elementor.config.home_url }/wp-json/${ namespace }/v${ version }/`;

		// Clear auto cache.
		$e.commandsInternal.on( 'run', ( component, command, args ) => {
			if ( 'document/save/save' === command && args.document.id ) {
				Object.values( this.autoCache ).forEach( ( componentCache ) => {
					// Delete all cache for specific document.
					if ( componentCache[ args.document.id ] ) {
						delete componentCache[ args.document.id ];
					}
				} );
			}

			// Delete empty components.
			Object.entries( this.autoCache ).forEach( ( [ componentName, componentCache ] ) => {
				if ( 0 === Object.keys( componentCache ).length ) {
					delete this.autoCache[ componentName ];
				}
			} );
		} );
	}

	getHTTPMethod( type ) {
		switch ( type ) {
			case 'create':
				return 'POST';

			case 'delete':
				return 'DELETE';

			case 'get':
				return 'GET';

			case 'update':
				return 'PUT';
		}

		return false;
	}

	getAllowedMethods( type ) {
		switch ( type ) {
			case 'create':
				return CREATABLE;

			case 'delete':
				return DELETABLE;

			case 'get':
				return READABLE;

			case 'update':
				return EDITABLE;
		}

		return false;
	}

	/**
	 * @param {string} type
	 * @param {string} command
	 * @param {{}} args
	 *
	 * @returns {string} Endpoint
	 */
	commandToEndpoint( type, command, args ) {
		let endPoint = command;

		if ( endPoint.includes( 'index' ) ) {
			endPoint = endPoint.replace( 'index', '' );
		}

		if ( args.id ) {
			endPoint += '/' + args.id.toString() + '/';

			delete args.id;
		}

		const argsEntries = Object.entries( args );

		// Upon 'GET' args will become part of get params.
		if ( 'get' === type && argsEntries.length ) {
			endPoint += '?';

			argsEntries.forEach( ( [ name, value ] ) => {
				endPoint += name + '=' + value + '&';
			} );
		}

		return endPoint;
	}

	fetch( type, requestData ) {
		// TODO: Check if 'include' is required.
		const params = {
				credentials: 'include', // cookies
			},
			headers = {};

		requestData.command = this.commandToEndpoint( type, requestData.command, requestData.args );

		/**
		 * Translate:
		 * 'create, delete, get, update' to HTTP Methods:
		 * 'GET, POST, PUT, PATCH, DELETE'
		 */
		const allowedMethods = this.getAllowedMethods( type ),
			method = this.getHTTPMethod( type );

		if ( 'GET' === method ) {
			Object.assign( params, { headers } );
		} else if ( allowedMethods ) {
			Object.assign( headers, { 'Content-Type': 'application/json' } );
			Object.assign( params, {
				method,
				headers: headers,
				body: JSON.stringify( requestData ),
			} );
		} else {
			throw Error( `Invalid type: '${ type }'` );
		}

		let cachePromise;

		if ( requestData.args.autoCache ) {
			cachePromise = this.fetchCacheAuto( type, requestData );

			if ( cachePromise ) {
				return cachePromise;
			}
		}

		return new Promise( async ( resolve, reject ) => {
			try {
				const request = window.fetch( this.baseEndpointAddress + requestData.command, params );

				let response = await request.then();

				await request.catch( reject );

				if ( ! response.ok ) {
					throw response;
				}

				// Ensure JSON.
				response = await response.json();

				// Catch wp reset errors.
				if ( response.data && response.data.status && response.code ) {
					reject( response.message );

					return response;
				}

				if ( requestData.args.autoCache ) {
					this.autoCacheResponse( method, requestData, response );
				}

				resolve( response );
			} catch ( e ) {
				reject( e );
			}
		} );
	}

	// TODO: Remove - Development test function.
	validateAutoCacheArgs( args ) {
		// Minimal requirement.
		if ( -1 === Object.values( args ).indexOf( [ 'component', 'document_id' ] ) ) {
			return true;
		}

		return false;
	}

	// TODO: Remove - Development test function.
	autoCacheResponse( method, requestData, response ) {
		if ( ! this.validateAutoCacheArgs( requestData.args ) ) {
			return false;
		}

		if ( ! response?.id ) {
			return false;
		}

		const documentId = requestData.args.document_id,
			component = requestData.component;

		if ( this.autoCache[ component ] && this.autoCache[ component ][ documentId ] ) {
			return false;
		}

		requestData.args.element = response;

		// Simulate fetch in reverse order.
		// TODO: Remove - Create, addCache function.
		this.fetchCacheAuto( 'create', requestData );
	}

	// TODO: Remove - Development test function.
	fetchCacheAuto( method, requestData ) {
		if ( ! this.validateAutoCacheArgs( requestData.args ) ) {
			return false;
		}

		const documentId = requestData.args.document_id,
			component = requestData.component;

		switch ( method ) {
			case 'get': {
				if ( this.autoCache[ component ] && this.autoCache[ component ][ documentId ] ) {
					// TODO: Filter probably wasting cpu here since `similar[ 0 ]` always used.
					const similar = this.autoCache[ component ][ documentId ].filter( ( cacheItem ) =>
						documentId === cacheItem.args.document_id &&
						requestData.args.element_id === cacheItem.args.element_id
					);

					let data;

					if ( similar.length ) {
						data = similar[ similar.length - 1 ].args.element;
					} else {
						// TODO: Maybe get info from local.
						// HINT : defaultSettings.
						// const container = elementor.getContainer( requestData.args.element_id );
						//
						// if ( container ) {
						// 	data = container.model.toJSON();
						// }
						//
						// return false;
					}

					if ( ! data ) {
						break;
					}

					return new Promise( async ( resolve ) => {
						resolve( data );
					} );
				}
			}
			break;

			case 'create': {
				if ( ! this.autoCache[ component ] ) {
					this.autoCache[ component ] = {};
				}

				if ( ! this.autoCache[ component ][ documentId ] ) {
					this.autoCache[ component ][ documentId ] = [];
				}

				this.autoCache[ component ][ documentId ].push( requestData );

				return new Promise( async ( resolve ) => {
					resolve( { success: true } );
				} );
			}

			default:
				throw Error( `Invalid method: '${ method }'` );
		}

		return false;
	}
}
