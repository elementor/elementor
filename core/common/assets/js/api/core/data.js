import ArgsObject from 'elementor-assets-js/modules/imports/args-object';
import Commands from './commands.js';
import Cache from './data/cache';
import BulkComponent from './data/components/bulk/component';

/**
 * @typedef {('create'|'delete'|'get'|'update')} DataTypes
 */

/**
 * @typedef {boolean|{before: (function(*=): {}), after: (function({}, *=): {})}} ApplyMethods
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
 * @property {*} [data]
 * @property {ApplyMethods} applyMethods
 * Bulk:
 * @property {Promise} [promise]
 * @property {{}} [executor]
 */

/**
 * @typedef {object} ExtractedCommand
 * @property {string} command
 * @property {object} args
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
			useBulk: true,
		} );

		this.cache = new Cache( this );
		this.validatedRequests = {};
		this.commandFormats = {};

		this.baseEndpointAddress = '';

		const { namespace, version } = this.args;

		this.baseEndpointAddress = `${ elementorCommon.config.urls.rest }${ namespace }/v${ version }/`;

		if ( this.args.useBulk ) {
			elementorCommon.elements.$window.on( 'elementorCommon:init-components', () => {
				/**
			    * @type {BulkComponent}
			    */
				this.bulk = $e.components.register( new BulkComponent() );
			} );
		}
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
	 * For example `component/command/{arg}` => `controller/endpoint/8`.
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
		let endpoint = command,
			isMagicParams = false;

		const argsQueryLength = args?.query ? Object.values( args.query ).length : 0;

		if ( argsQueryLength ) {
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

				isMagicParams = true;
				endpoint = format;
			}
		}

		if ( ! isMagicParams && format ) {
			// No magic params, but still format
			endpoint = format;
		}

		// If requested magic param does not exist in args, need to remove it to have fixed endpoint.
		// eg: 'documents/{documentId}/elements/{elementId}' and args { documentId: 4123 }.
		// result: 'documents/4123/elements'
		if ( format && endpoint.includes( '/{' ) ) {
			endpoint = endpoint.substring( 0, endpoint.indexOf( '/{' ) );
		}

		if ( args.query && Object.values( args.query ).length ) {
			// Sorting since the endpoint later will be used as key to store the cache.
			const queryEntries = Object.entries( args.query ).sort(
				( [ aKey ], [ bKey ] ) => aKey - bKey // Sort by param name.
			);

			// `args.query` will become a part of GET params.
			if ( queryEntries.length ) {
				endpoint += '?';

				queryEntries.forEach( ( [ name, value ] ) => {
					if ( Array.isArray( value ) ) {
						value.forEach( ( item ) => {
							endpoint += name + '[]=' + item + '&';
						} );
					} else if ( 'string' === typeof value || 'number' === typeof value ) {
						endpoint += name + '=' + value + '&';
					} else {
						throw new RangeError( 'Invalid type of value' );
					}
				} );
			}

			// If last character is '&' remove it.
			endpoint = endpoint.replace( /&$/, '' );
		}

		return endpoint;
	}

	/**
	 * Function commandExtractArgs().
	 *
	 * If the command have query convert it to args.
	 *
	 * @param {string} command
	 * @param {object} args
	 *
	 * @returns {ExtractedCommand} command
	 */
	commandExtractArgs( command, args = {} ) {
		if ( command?.includes( '?' ) ) {
			if ( ! args.query ) {
				args.query = {};
			}

			const commandParts = command.split( '?' ),
				pureCommand = commandParts[ 0 ],
				queryString = commandParts[ 1 ],
				query = new URLSearchParams( queryString );

			Object.assign( args.query, Object.fromEntries( query ) );

			command = pureCommand;
		}

		return {
			command,
			args,
		};
	}

	/**
	 * Function validateRequestData().
	 *
	 * Validate request data requirements.
	 *
	 * @param {RequestData} requestData
	 * @param {boolean} [requireArgsData]
	 */
	validateRequestData( requestData, requireArgsData = false ) {
		// Do not validate if its already valid.
		if ( requestData.timestamp && this.validatedRequests[ requestData.timestamp ] ) {
			return;
		}

		const argsObject = new ArgsObject( requestData );

		argsObject.requireArgument( 'component' );
		argsObject.requireArgumentType( 'command', 'string' );
		argsObject.requireArgumentType( 'endpoint', 'string' );

		if ( requireArgsData ) {
			argsObject.requireArgumentType( 'data', 'object', requestData.args );
		}

		// Ensure timestamp.
		if ( ! requestData.timestamp ) {
			requestData.timestamp = new Date().getTime();
		}

		this.validatedRequests[ requestData.timestamp ] = true;
	}

	/**
	 * Function handleResponse().
	 *
	 * @param {ApplyMethods} applyMethods
	 * @param {RequestData} requestData
	 * @param {{}} response
	 *
	 * @returns {*}
	 */
	handleResponse( requestData, response, applyMethods = false ) {
		if ( ! applyMethods && requestData.applyMethods ) {
			applyMethods = requestData.applyMethods;
		}

		// Run 'after' method.
		if ( applyMethods ) {
			requestData.applyMethods = applyMethods;
			response = applyMethods.after.apply( this, [ response, this.args ] );
		}

		response = { data: response };

		// Append requestData.
		response = Object.assign( { __requestData__: requestData }, response );

		requestData.data = response;

		return response;
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
			if ( [ 'POST', 'PUT' ].includes( method ) && ! requestData.args?.data ) {
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
	 * Function fetchCache().
	 *
	 * @param {RequestData} requestData
	 * @returns {Promise|boolean}
	 */
	fetchCache( requestData ) {
		requestData.cache = 'miss';

		return this.cache.getAsync( requestData );
	}

	/**
	 * Function fetch().
	 *
	 * @param {RequestData} requestData
	 * @param {function(input: RequestInfo, init?) : Promise<Response> } [fetchAPI]
	 *
	 * @returns {Promise}
	 */
	fetch( requestData, fetchAPI = window.fetch ) {
		const params = this.prepareHeaders( requestData ),
			isCacheRequired = this.isCacheRequired( requestData ),
			cache = isCacheRequired && 'get' === requestData.type ? this.fetchCache( requestData ) : false;

		return cache || new Promise( async ( resolve, reject ) => {
			// This function is async because:
			// it needs to wait for the results, to cache them before it resolve's the promise.
			try {
				const request = fetchAPI( this.baseEndpointAddress + requestData.endpoint, params ),
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
				if ( isCacheRequired ) {
					this.cache.set( requestData, response );
				}

				resolve( this.handleResponse( requestData, response ) );
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
			endpoint: this.commandToEndpoint( command, args, this.commandFormats[ command ] ),
			component,
			command,
			args,
		} );
	}

	/**
	 * Function setCache().
	 *
	 * @param {ComponentBase} component
	 * @param {string} command
	 * @param {{}} query
	 * @param {*} data
	 */
	setCache( component, command, query, data ) {
		const args = { query };

		this.cache.set( {
				endpoint: this.commandToEndpoint( command, args, this.commandFormats[ command ] ),
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
	 * The difference between 'setCache' and 'updateCache' is update will only modify exist values.
	 * and 'setCache' will create or update.
	 *
	 * @param {ComponentBase} component
	 * @param {string} command
	 * @param {{}} query
	 * @param {*} data
	 */
	updateCache( component, command, query, data ) {
		const args = { query, data };

		this.cache.update( {
			endpoint: this.commandToEndpoint( command, args, this.commandFormats[ command ] ),
			component,
			command,
			args,
		} );
	}

	/**
	 * Function deleteCache().
	 *
	 * @param {ComponentBase} component
	 * @param {string} command
	 * @param {{}} query
	 */
	deleteCache( component, command, query = {} ) {
		const args = { query };

		this.cache.delete( {
				endpoint: this.commandToEndpoint( command, args, this.commandFormats[ command ] ),
				component,
				command,
				args,
			}
		);
	}

	/**
	 * Function registerFormat().
	 *
	 * Register's format for each command.
	 *
	 * @param {string} command
	 * @param {string} format
	 */
	registerFormat( command, format ) {
		this.commandFormats[ command ] = format;
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
	 * Function isCacheRequired().
	 *
	 * @param {RequestData} requestData
	 */
	isCacheRequired( requestData ) {
		return [ 'create', 'get' ].includes( requestData.type ) && ! requestData.args.options?.refresh;
	}

	/**
	 * @param {ComponentBase} component
	 * @param {string} command
	 * @param callback
	 */
	register( component, command, callback ) {
		super.register( component, command, callback );

		const fullCommandName = component.getNamespace() + '/' + command,
			commandInstance = $e.commands.getCommandClass( fullCommandName ),
			format = commandInstance?.getEndpointFormat ? commandInstance.getEndpointFormat() : false;

		if ( format ) {
			$e.data.registerFormat( fullCommandName, format );
		}
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

		( { command, args } = this.commandExtractArgs( command, args ) );

		return super.run( command, args );
	}

	error( message ) {
		throw Error( 'Data commands: ' + message );
	}
}
