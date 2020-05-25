import ArgsObject from 'elementor-assets-js/modules/imports/args-object';
import Commands from './commands.js';
import Cache from './data/cache';

/**
 * @typedef {('create'|'delete'|'get'|'update')} DataTypes
 */

/**
 * @typedef {{}} RequestData
 * @property {ComponentBase} component
 * @property {string} command
 * @property {string} endpoint
 * @property {DataTypes} [type]
 * @property {{}} [args]
 * @property {number} [timestamp]
 * @property {('hit'|'miss')} [cache]
 */

// TODO: Return it from the server. Original at WP_REST_Server.
export const READABLE = [ 'GET' ],
	CREATABLE = [ 'POST' ],
	EDITABLE = [ 'POST', 'PUT', 'PATCH' ],
	DELETABLE = [ 'DELETE' ],
	ALLMETHODS = [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE' ];

export default class Data extends Commands {
	constructor( args = {} ) {
		super( args );

		this.args = Object.assign( args, {
			namespace: 'elementor',
			version: '1',
		} );

		this.cache = new Cache( this );
		this.validatedRequests = {};

		this.baseEndpointAddress = '';

		elementorCommon.elements.$window.on( 'elementor:loaded', this.onElementorLoaded.bind( this ) );
	}

	onElementorLoaded() {
		const { namespace, version } = this.args;

		this.baseEndpointAddress = `${ elementorCommon.config.rest_url }${ namespace }/v${ version }/`;
	}

	/**
	 * Function getHTTPMethod().
	 *
	 * Returns HTTP Method by type.
	 *
	 * @param {DataTypes} type
	 *
	 * @return {string|boolean}
	 */
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

	/**
	 * Function getAllowedMethods().
	 *
	 * Returns allowed HTTP methods by type.
	 *
	 * @param {DataTypes} type
	 *
	 * @return {[string]|boolean}
	 */
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
	 * Function commandToEndpoint().
	 *
	 * Convert command to endpoint.
	 *
	 * For example `component/command/:arg_example` => `controller/endpoint/8`.
	 *
	 * TODO: Find a better solution.
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {string|null} [format]
	 *
	 * @returns {string} endpoint
	 */
	commandToEndpoint( command, args, format = null ) {
		let endpoint = command;

		if ( args.query ) {
			if ( ! format ) {
				format = command;
			}

			if ( format && format.includes( '/{' ) ) {
				// Means command includes magic query arguments ( controller/endpoint/{whatever} ).
				const magicParams = format.split( '/' ).filter( ( str ) => '{' === str.charAt( 0 ) );

				magicParams.forEach( ( param ) => {
					// Remove the '{', '}'.
					param = param.replace( '{', '' );
					param = param.replace( '}', '' );

					const formatted = Object.entries( args.query ).find( ( [ key ] ) => key === param );

					if ( ! formatted ) {
						return;
					}

					const key = formatted[ 0 ],
						value = formatted[ 1 ].toString();

					// Replace magic params with values.
					format = format.replace( new RegExp( '{' + param + '}', 'g' ), value );

					delete args.query[ key ];
				} );

				endpoint = format;
			}

			if ( endpoint.includes( 'index' ) ) {
				endpoint = endpoint.replace( '/index', '' );
			}

			if ( args.query.id ) {
				endpoint += '/' + args.query.id.toString();
				delete args.query.id;
			}

			// Sorting since the endpoint later will be used as key to store the cache.
			const queryEntries = Object.entries( args.query ).sort(
				( [ aKey ], [ bKey ] ) => aKey - bKey // Sort by param name.
			);

			// `args.query` will become a part of GET params.
			if ( queryEntries.length ) {
				endpoint += '?';

				queryEntries.forEach( ( [ name, value ] ) => {
					endpoint += name + '=' + value + '&';
				} );
			}

			// If last character is '&' remove it.
			endpoint = endpoint.replace( /&$/, '' );
		}

		// If requested magic param does not exist in args, need to remove it to have fixed endpoint.
		// eg: 'documents/{documentId}/elements/{elementId}' and args { documentId: 4123 }.
		// result: 'documents/4123/elements'
		if ( endpoint.includes( '/{' ) ) {
			endpoint = endpoint.substring( 0, endpoint.indexOf( '/{' ) );
		}

		return endpoint;
	}

	/**
	 * Function endpointToCommand().
	 *
	 * Convert endpoint to command.
	 *
	 * TODO: Find a better solution
	 *
	 * @param {string} endpoint
	 * @param {object} args
	 *
	 * @return {string} command
	 */
	endpointToCommand( endpoint, args = {} ) {
		let command = endpoint,
			commandFound = !! $e.data.commands[ endpoint ];

		const endpointParts = endpoint.split( '/' );

		// Assuming the command maybe index.
		if ( ! commandFound && $e.data.commands[ endpoint + '/index' ] ) {
			command = endpoint + '/index';
			commandFound = true;
		}

		// Maybe the it has 'id' as last endpointPart.
		if ( ! commandFound ) {
			// Remove last parameter.
			const lastParameter = endpointParts[ endpointParts.length - 1 ],
				assumedCommand = command.replace( '/' + lastParameter, '' );

			// If assumed command ( without last parameter ) exist.
			if ( $e.data.commands[ assumedCommand ] ) {
				command = assumedCommand;
				commandFound = true;

				if ( ! args.query ) {
					args.query = {};
				}

				// Warp with 'id'.
				args.query.id = lastParameter;
			}
		}

		return command;
	}

	/**
	 * Function validateRequestData().
	 *
	 * Validate request data requirements.
	 *
	 * @param {RequestData} requestData
	 */
	validateRequestData( requestData ) {
		// Do not validate if its already valid.
		if ( requestData.timestamp && this.validatedRequests[ requestData.timestamp ] ) {
			return;
		}

		const argsObject = new ArgsObject( requestData );

		argsObject.requireArgument( 'component', requestData );
		argsObject.requireArgumentType( 'command', 'string', requestData );
		argsObject.requireArgumentType( 'endpoint', 'string', requestData );

		// Ensure timestamp.
		if ( ! requestData.timestamp ) {
			requestData.timestamp = new Date().getTime();
		}

		this.validatedRequests[ requestData.timestamp ] = true;
	}

	/**
	 * Function prepareHeaders().
	 *
	 * @param {RequestData} requestData
	 *
	 * @return {{}} params
	 */
	prepareHeaders( requestData ) {
		/* global wpApiSettings */
		const type = requestData.type,
			nonce = wpApiSettings.nonce,
			params = {
				credentials: 'include', // cookies is required for wp reset.
			},
			headers = { 'X-WP-Nonce': nonce };

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
			if ( ! requestData.args?.data ) {
				throw Error( 'Invalid requestData.args.data' );
			}

			Object.assign( headers, { 'Content-Type': 'application/json' } );
			Object.assign( params, {
				method,
				headers,
				body: JSON.stringify( requestData.args.data ),
			} );
		} else {
			throw Error( `Invalid type: '${ type }'` );
		}

		return params;
	}

	/**
	 * Function fetch().
	 *
	 * @param {RequestData} requestData
	 *
	 * @return {{}} params
	 */
	fetch( requestData ) {
		requestData.cache = 'miss';

		const params = this.prepareHeaders( requestData ),
			useCache = 'get' === requestData.type && ! requestData.args.options?.refresh;

		if ( useCache ) {
			const cachePromise = this.cache.getAsync( requestData );

			if ( cachePromise ) {
				return cachePromise;
			}
		}

		// TODO: Test 'window.fetch' have the right endpoint.
		return new Promise( async ( resolve, reject ) => {
			// This function is async because:
			// it needs to wait for the results, to cache them before it resolve's the promise.
			try {
				const request = window.fetch( this.baseEndpointAddress + requestData.endpoint, params ),
					response = await request.then( async ( _response ) => {
						if ( ! _response.ok ) {
							// Catch WP REST errors.
							if ( _response.headers.get( 'content-type' ).includes( 'application/json' ) ) {
								_response = await _response.json();
							}

							throw _response;
						}

						return _response.json();
					} );

				// At this point, it got the resolved response from remote.
				// So load cache, and resolve it.
				if ( useCache ) {
					this.cache.load( requestData, response );
				}

				resolve( response );
			} catch ( e ) {
				reject( e );
			}
		} );
	}

	/**
	 * Function getCache().
	 *
	 * @param {ComponentBase} component
	 * @param {string} command
	 * @param {{}} query
	 *
	 * @returns {{}}
	 */
	getCache( component, command, query = {} ) {
		const args = { query };

		return this.cache.get( {
			endpoint: this.commandToEndpoint( command, args ),
			component,
			command,
			args,
		} );
	}

	/**
	 * Function loadCache().
	 *
	 * @param {ComponentBase} component
	 * @param {string} command
	 * @param {{}} query
	 * @param {*} data
	 */
	loadCache( component, command, query, data ) {
		const args = { query };

		this.cache.load( {
				endpoint: this.commandToEndpoint( command, args ),
				component,
				command,
				args,
			},
			data
		);
	}

	/**
	 * Function updateCache().
	 *
	 * The difference between 'loadCache' and 'updateCache' is update will only modify exist values.
	 * and 'loadCache' will create or update.
	 *
	 * @param {ComponentBase} component
	 * @param {string} command
	 * @param {{}} query
	 * @param {*} data
	 */
	updateCache( component, command, query, data ) {
		const args = { query, data };

		this.cache.update( {
			endpoint: this.commandToEndpoint( command, args ),
			component,
			command,
			args,
		} );
	}

	/**
	 * Function deleteCache().
	 *
	 * @param {string} command
	 * @param {{}} query
	 */
	deleteCache( command, query = {} ) {
		const args = { query },
			endpoint = this.commandToEndpoint( command, args );

		if ( Object.values( query ).length ) {
			args.query = query;
		}

		this.cache.delete( endpoint );
	}

	create( command, data, query = {}, options = {} ) {
		return this.run( 'create', command, { query, options, data } );
	}

	delete( command, query = {}, options = {} ) {
		return this.run( 'delete', command, { query, options } );
	}

	get( command, query = {}, options = {} ) {
		return this.run( 'get', command, { query, options } );
	}

	update( command, data, query = {}, options = {} ) {
		return this.run( 'update', command, { query, options, data } );
	}

	/**
	 * TODO: Add JSDOC typedef for args ( query and options ).
	 *
	 * @param {DataTypes} type
	 * @param {string} command
	 * @param {{}} args
	 *
	 * @return {*}
	 */
	run( type, command, args ) {
		args.options.type = type;

		return super.run( command, args );
	}

	error( message ) {
		throw Error( 'Data commands: ' + message );
	}
}
