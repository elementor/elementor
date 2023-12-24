import ArgsObject from 'elementor-assets-js/modules/imports/args-object';
import Commands from './commands.js';
import Cache from './data/cache';

/**
 * @typedef {('create'|'delete'|'get'|'update'|'options')} DataTypes
 */
/**
 * @typedef {import('../modules/component-base')} ComponentBase
 */
/**
 * @typedef {{}} RequestInfo
 */

/**
 * @typedef {{}} RequestData
 * @property {ComponentBase}  component         component
 * @property {string}         command           command
 * @property {{}}             args              arguments
 * @property {DataTypes}      type              type
 * @property {number}         timestamp         timestamp
 * @property {string}         endpoint          endpoint
 *
 * @property {string}         [baseEndpointURL] baseEndpointURL
 * @property {string}         [namespace]       namespace
 * @property {string}         [version]         version
 * @property {('hit'|'miss')} [cache]           cache
 */

/**
 * @typedef {Object} ExtractedCommand
 * @property {string} command command
 * @property {Object} args    arguments
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
			baseEndpointURL: elementorWebCliConfig.urls.rest,
		} );

		this.cache = new Cache( this );
		this.validatedRequests = {};
		this.commandFormats = {};
	}

	/**
	 * Function getHTTPMethod().
	 *
	 * Returns HTTP Method by type.
	 *
	 * @param {DataTypes} type
	 *
	 * @return {string|boolean} HTTP Method
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

			case 'options':
				return 'OPTIONS';
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
	 * @return {[string]|boolean} allowed HTTP methods
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

			case 'options':
				return [ 'OPTIONS' ];
		}

		return false;
	}

	/**
	 * Function getEndpointURL().
	 *
	 * Get remote endpoint address.
	 *
	 * @param {RequestData} requestData
	 * @param {string}      [endpoint=requestData.endpoint]
	 *
	 * @return {string} endpoint address
	 */
	getEndpointURL( requestData, endpoint = requestData.endpoint ) {
		// Allow to request data override default namespace and args.
		const {
			baseEndpointURL = this.args.baseEndpointURL,
			namespace = this.args.namespace,
			version = this.args.version,
		} = requestData;

		return `${ baseEndpointURL }${ namespace }/v${ version }/` + endpoint;
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
	 * @param {string}      command
	 * @param {{}}          args
	 * @param {string|null} [format]
	 *
	 * @return {string} endpoint
	 */
	commandToEndpoint( command, args, format = null ) {
		let endpoint = command;

		const argsQueryLength = args?.query ? Object.values( args.query ).length : 0;

		if ( argsQueryLength && format && format.includes( '/{' ) ) {
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
		}

		if ( format ) {
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
				( [ aKey ], [ bKey ] ) => aKey - bKey, // Sort by param name.
			);

			// `args.query` will become a part of GET params.
			if ( queryEntries.length ) {
				endpoint += '?';

				queryEntries.forEach( ( [ name, value ] ) => {
					// Replace the character '/' with the encoded version,
					// mostly because when saving this endpoint value to the cache it splits the url base on the '/' character.
					value = `${ value }`.replace( /\//g, '%2F' );

					endpoint += name + '=' + value + '&';
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
	 * @param {Object} args
	 *
	 * @return {ExtractedCommand} command
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
	 * @param {boolean}     [requireArgsData]
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
	 * Function prepareHeaders().
	 *
	 * Prepare the headers for each request.
	 *
	 * @param {RequestData} requestData
	 *
	 * @return {{}} params
	 */
	prepareHeaders( requestData ) {
		const type = requestData.type,
			nonce = elementorWebCliConfig.nonce,
			params = {
				signal: requestData.args?.options?.signal,
				credentials: 'include', // Cookies is required for wp reset.
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

			if ( requestData.args?.headers ) {
				Object.assign( headers, requestData.args.headers );
			}

			Object.assign( params, {
				method,
				headers,
				body: 'application/json' === headers[ 'Content-Type' ] ? JSON.stringify( requestData.args.data ) : requestData.args.data,
			} );
		} else {
			throw Error( `Invalid type: '${ type }'` );
		}

		return params;
	}

	/**
	 * Function prepareEndpoint().
	 *
	 * This method response for building a final endpoint,
	 * the main problem is with plain permalink mode + command with query params that creates a weird url,
	 * the current method should fix it.
	 *
	 * @param {RequestData} requestData
	 *
	 * @return {string} Endpoint URL
	 */
	prepareEndpoint( requestData ) {
		const splitEndpoint = requestData.endpoint.split( '?' ),
			endpoint = splitEndpoint.shift();

		let endpointAddress = this.getEndpointURL( requestData, endpoint );

		if ( splitEndpoint.length ) {
			const separator = endpointAddress.includes( '?' ) ? '&' : '?';

			endpointAddress += separator + splitEndpoint.pop();
		}

		return endpointAddress;
	}

	/**
	 * Function fetch().
	 *
	 * @param {RequestData}                                  requestData
	 * @param {function(RequestInfo,*) : Promise<Response> } [fetchAPI]
	 *
	 * @return {Promise<Response>} response
	 */
	fetch( requestData, fetchAPI = window.fetch ) {
		requestData.cache = 'miss';

		const refresh = requestData.args.options?.refresh,
			getCache = 'get' === requestData.type && ! refresh,
			saveCache = [ 'create', 'get' ].includes( requestData.type ) && ! refresh;

		if ( getCache ) {
			const cachePromise = this.cache.getAsync( requestData );

			if ( cachePromise ) {
				return cachePromise;
			}
		}

		const params = this.prepareHeaders( requestData );
		// eslint-disable-next-line no-async-promise-executor
		return new Promise( async ( resolve, reject ) => {
			// This function is async because:
			// it needs to wait for the results, to cache them before it resolve's the promise.
			try {
				const endpoint = this.prepareEndpoint( requestData ),
					request = fetchAPI( endpoint, params ),
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
				if ( saveCache ) {
					this.cache.set( requestData, response );
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
	 * @param {string}        command
	 * @param {{}}            query
	 *
	 * @return {{}} cache object
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
	 * @param {string}        command
	 * @param {{}}            query
	 * @param {*}             data
	 */
	setCache( component, command, query, data ) {
		const args = { query };

		this.cache.set( {
			endpoint: this.commandToEndpoint( command, args, this.commandFormats[ command ] ),
			component,
			command,
			args,
		}, data );
	}

	/**
	 * Function updateCache().
	 *
	 * The difference between 'setCache' and 'updateCache' is update will only modify exist values.
	 * and 'setCache' will create or update.
	 *
	 * @param {ComponentBase} component
	 * @param {string}        command
	 * @param {{}}            query
	 * @param {*}             data
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
	 * @param {string}        command
	 * @param {{}}            query
	 */
	deleteCache( component, command, query = {} ) {
		const args = { query };

		this.cache.delete( {
			endpoint: this.commandToEndpoint( command, args, this.commandFormats[ command ] ),
			component,
			command,
			args,
		} );
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

	/**
	 * Function create().
	 *
	 * Run a command, that will be translated as endpoint for creating new data.
	 *
	 * @param {string} command
	 * @param {*}      data
	 * @param {{}}     query
	 * @param {{}}     options
	 *
	 * @return {*} result
	 */
	create( command, data, query = {}, options = {} ) {
		return this.run( 'create', command, { query, options, data } );
	}

	/**
	 * Function delete().
	 *
	 * Run a command, that will be translated as endpoint for deleting data.
	 *
	 * @param {string} command
	 * @param {{}}     query
	 * @param {{}}     options
	 *
	 * @return {*} result
	 */
	delete( command, query = {}, options = {} ) {
		return this.run( 'delete', command, { query, options } );
	}

	/**
	 * Function get().
	 *
	 * Run a command, that will be translated as endpoint for getting data.
	 *
	 * @param {string} command
	 * @param {{}}     query
	 * @param {{}}     options
	 *
	 * @return {*} result
	 */
	get( command, query = {}, options = {} ) {
		return this.run( 'get', command, { query, options } );
	}

	/**
	 * Function update().
	 *
	 * Run a command, that will be translated as endpoint for updating data.
	 *
	 * @param {string} command
	 * @param {*}      data
	 * @param {{}}     query
	 * @param {{}}     options
	 *
	 * @return {*} result
	 */
	update( command, data, query = {}, options = {} ) {
		return this.run( 'update', command, { query, options, data } );
	}

	/**
	 * Function options().
	 *
	 * Run a command, that will be translated as endpoint for requesting options/information about specific endpoint.
	 *
	 * @param {string} command
	 * @param {{}}     query
	 * @param {{}}     options
	 *
	 * @return {*} result
	 */
	options( command, query, options = {} ) {
		return this.run( 'options', command, { query, options } );
	}

	register( component, command, callback ) {
		super.register( component, command, callback );

		const fullCommandName = component.getNamespace() + '/' + command,
			commandInstance = $e.data.getCommandClass( fullCommandName ),
			format = commandInstance?.getEndpointFormat ? commandInstance.getEndpointFormat() : false;

		if ( format ) {
			$e.data.registerFormat( fullCommandName, format );
		}

		return this;
	}

	/**
	 * TODO: Add JSDOC typedef for args ( query and options ).
	 *
	 * @param {DataTypes} type
	 * @param {string}    command
	 * @param {{}}        args
	 *
	 * @override
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
