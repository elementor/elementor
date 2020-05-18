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

		this.baseEndpointAddress = '';

		elementorCommon.elements.$window.on( 'elementor:loaded', this.onElementorLoaded.bind( this ) );
	}

	onElementorLoaded() {
		const { namespace, version } = this.args;

		this.baseEndpointAddress = `${ elementor.config.rest_url }${ namespace }/v${ version }/`;
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

			if ( format && format.includes( '/:' ) ) {
				// Means command includes magic query arguments ( controller/endpoint/:whatever ).
				const magicParams = format.split( '/' ).filter( ( str ) => ':' === str.charAt( 0 ) );

				magicParams.forEach( ( param ) => {
					// Remove the ':'.
					param = param.substr( 1 );

					const formatted = Object.entries( args.query ).find( ( [ key ] ) => key === param );

					if ( ! formatted ) {
						return;
					}

					const key = formatted[ 0 ],
						value = formatted[ 1 ].toString();

					format = format.replace( new RegExp( ':' + param, 'g' ), value );

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
		// eg: 'documents/:documentId/elements/:elementId' and args { documentId: 4123 }.
		// result: 'documents/4123/elements'
		if ( endpoint.includes( '/:' ) ) {
			endpoint = endpoint.substring( 0, endpoint.indexOf( '/:' ) );
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
	 * Function prepareHeaders().
	 *
	 * @param {DataTypes} type
	 * @param {RequestData} requestData
	 *
	 * @return {{}} params
	 */
	prepareHeaders( type, requestData ) {
		/* global wpApiSettings */
		const nonce = wpApiSettings.nonce,
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
			Object.assign( headers, { 'Content-Type': 'application/json' } );
			Object.assign( params, {
				method,
				headers,
				body: JSON.stringify( requestData ),
			} );
		} else {
			throw Error( `Invalid type: '${ type }'` );
		}

		return params;
	}

	/**
	 * Function fetch().
	 *
	 * @param {DataTypes} type
	 * @param {RequestData} requestData
	 *
	 * @return {{}} params
	 */
	fetch( type, requestData ) {
		requestData.cache = 'miss';

		const params = this.prepareHeaders( type, requestData ),
			useCache = 'get' === type && ! requestData.args.options?.refresh;

		if ( useCache ) {
			const cachePromise = this.cache.receive( requestData );

			if ( cachePromise ) {
				return cachePromise;
			}
		}

		return new Promise( async ( resolve, reject ) => {
			try {
				const request = window.fetch( this.baseEndpointAddress + requestData.endpoint, params );

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

				// Upon 'GET' save cache.
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
