import Commands from './commands.js';
import Cache from './data/cache';

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
			endPoint = endPoint.replace( '/index', '' );
		}

		if ( args.query.id ) {
			endPoint += '/' + args.query.id.toString();

			delete args.query.id;
		}

		if ( 'get' === type ) {
			// Sorting since the endpoint later will be used as key to store the cache.
			const queryEntries = Object.entries( args.query ).sort(
				( [ aKey ], [ bKey ] ) => aKey - bKey // Sort by param name.
			);

			// Upon 'GET', `args.query` will become part of get params.
			if ( queryEntries.length ) {
				endPoint += '?';

				queryEntries.forEach( ( [ name, value ] ) => {
					endPoint += name + '=' + value + '&';
				} );
			}
		}

		return endPoint;
	}

	endpointToCommand( endpoint, args ) {
		const { query, options } = args;

		let commandFound = !! $e.data.commands[ endpoint ];

		// Assuming the command maybe index.
		if ( ! commandFound && $e.data.commands[ endpoint + '/index' ] ) {
			endpoint = endpoint + '/index';
			commandFound = true;
		}

		// Maybe the endpoint includes 'id'. as part of the endpoint.
		if ( ! commandFound && 'get' === options.type ) {
			const endpointParts = endpoint.split( '/' ),
				assumedCommand = endpointParts[ 0 ] + '/' + endpointParts[ 1 ];

			if ( $e.data.commands[ assumedCommand ] ) {
				endpoint = assumedCommand;

				// Warp with 'id'.
				query.id = endpointParts[ 2 ];

				commandFound = true;
			}
		}

		return endpoint;
	}

	// TODO: Function too big part it.
	fetch( type, requestData ) {
		const nonce = wpApiSettings.nonce,
			params = {
				credentials: 'include', // cookies is required for wp reset.
			},
			headers = { 'X-WP-Nonce': nonce };

		requestData.endpoint = this.commandToEndpoint( type, requestData.command, requestData.args );
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

		if ( requestData.args.options.cache ) {
			let cachePromise;

			cachePromise = this.cache.receive( type, requestData.endpoint );

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

				if ( requestData.args.options.cache ) {
					this.cache.load( method, requestData, response );
				}

				resolve( response );
			} catch ( e ) {
				reject( e );
			}
		} );
	}

	loadCache( command, query, result ) {
		const args = { query },
			endpoint = this.commandToEndpoint( 'get', command, args );

		this.cache.load(
			'GET',
			{
				command,
				endpoint,
				args,
			},
			result
		);
	}

	deleteCache( command, query ) {
		const args = { query },
			endpoint = this.commandToEndpoint( 'get', command, args );

		return this.cache.delete( endpoint );
	}

	run( type, endpoint, args ) {
		args.options.type = type;

		const command = this.endpointToCommand( endpoint, args );

		return super.run( command, args );
	}

	create( endpoint, query = {}, options = {} ) {
		return this.run( 'create', endpoint, { query, options } );
	}

	delete( endpoint, query = {}, options = {} ) {
		return this.run( 'delete', endpoint, { query, options } );
	}

	get( endpoint, query = {}, options = {} ) {
		return this.run( 'get', endpoint, { query, options } );
	}

	update( endpoint, query = {}, options = {} ) {
		return this.run( 'update', endpoint, { query, options } );
	}

	error( message ) {
		throw Error( 'Data commands: ' + message );
	}
}
