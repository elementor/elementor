import Commands from './commands.js';
import Cache from './data/cache';

/**
 * @typedef {('create'|'delete'|'get'|'update')} DataTypes
 */

/**
 * @typedef {{}} RequestData

 * @property {string} command
 * @property {string} endpoint
 * @property {{}} args
 * @property {DataTypes} [type]
 * @property {number} [timestamp]
 * @property {Component} [component]
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
	 * @param {string} command
	 * @param {{}} args
	 *
	 * @returns {string} endpoint
	 */
	commandToEndpoint( command, args ) {
		let endPoint = command;

		if ( endPoint.includes( 'index' ) ) {
			endPoint = endPoint.replace( '/index', '' );
		}

		if ( args.query ) {
			if ( args.query.id ) {
				endPoint += '/' + args.query.id.toString();

				delete args.query.id;
			}

			// Sorting since the endpoint later will be used as key to store the cache.
			const queryEntries = Object.entries( args.query ).sort(
				( [ aKey ], [ bKey ] ) => aKey - bKey // Sort by param name.
			);

			// `args.query` will become part of GET params.
			if ( queryEntries.length ) {
				endPoint += '?';

				queryEntries.forEach( ( [ name, value ] ) => {
					endPoint += name + '=' + value + '&';
				} );
			}
		}

		return endPoint;
	}

	/**
	 * Function endpointToCommand().
	 *
	 * Convect endpoint to command.
	 *
	 * Guess if command is 'index' endpoint
	 * Guess if command is 'id' endpoint.
	 * Modify args in case the endpoint is 'id` ( eg: wp-json/endpoint/id ).
	 *
	 * @param endpoint
	 * @param args
	 *
	 * @return {string} command
	 */
	endpointToCommand( endpoint, args ) {
		let command = endpoint,
			commandFound = !! $e.data.commands[ endpoint ];

		// Assuming the command maybe index.
		if ( ! commandFound && $e.data.commands[ endpoint + '/index' ] ) {
			command = endpoint + '/index';
			commandFound = true;
		}

		// Maybe the endpoint includes 'id'. as part of the endpoint.
		if ( ! commandFound ) {
			const endpointParts = endpoint.split( '/' ),
				assumedCommand = endpointParts[ 0 ] + '/' + endpointParts[ 1 ];

			if ( $e.data.commands[ assumedCommand ] ) {
				command = assumedCommand;
				commandFound = true;

				if ( ! args.query ) {
					args.query = {};
				}

				// Warp with 'id'.
				args.query.id = endpointParts[ 2 ];
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
				headers: headers,
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
		requestData.endpoint = this.commandToEndpoint( requestData.command, requestData.args );

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
	 * @param {string} command
	 * @param {{}} query
	 *
	 * @return {*}
	 */
	getCache( command, query ) {
		const args = { query },
			endpoint = this.commandToEndpoint( command, args );

		return this.cache.get( {
			command,
			endpoint,
			args,
		} );
	}

	/**
	 * Function loadCache().
	 *
	 * @param {string} command
	 * @param {{}} query
	 * @param {*} data
	 */
	loadCache( command, query, data ) {
		const args = { query },
			endpoint = this.commandToEndpoint( command, args );

		this.cache.load(
			{
				command,
				endpoint,
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
	 * @param {string} command
	 * @param {{}} query
	 * @param {{}} data
	 */
	updateCache( command, query, data ) {
		const args = { query, data },
			endpoint = this.commandToEndpoint( command, args );

		this.cache.update(
			{
				command,
				endpoint,
				args,
			},
		);
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

	create( endpoint, data, query = {}, options = {} ) {
		return this.run( 'create', endpoint, { query, options, data } );
	}

	delete( endpoint, query = {}, options = {} ) {
		return this.run( 'delete', endpoint, { query, options } );
	}

	get( endpoint, query = {}, options = {} ) {
		return this.run( 'get', endpoint, { query, options } );
	}

	update( endpoint, data, query = {}, options = {} ) {
		return this.run( 'update', endpoint, { query, options, data } );
	}

	/**
	 * TODO: Add JSDOC typedef for query and options.
	 */
	run( type, endpoint, args ) {
		args.options.type = type;

		const command = this.endpointToCommand( endpoint, args );

		return super.run( command, args );
	}

	error( message ) {
		throw Error( 'Data commands: ' + message );
	}
}
