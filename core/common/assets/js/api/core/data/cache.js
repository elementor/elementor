import LocalStorage from './stroages/local-storage';

export default class Cache {
	/**
	 * @param {Data} manager
	 */
	constructor( manager ) {
		this.manager = manager;

		this.storage = new LocalStorage();
	}

	/**
	 * TODO: Add JSDOC.
	 */
	extractResponse( response, requestData, keyCallback, endpointCallback ) {
		const componentName = requestData.component?.getNamespace(),
			isIndexCommand = requestData.endpoint + '/index' === requestData.command,
			isQueryEmpty = 0 === Object.values( requestData.args.query ).length;

		if ( isQueryEmpty && isIndexCommand ) {
			// Handles situation when 'index' was forced to use like in 'globals' component.
			// EG: 'globals/index'.
			Object.entries( response ).forEach( ( [ key, value ] ) => {
				if ( 'object' === typeof value ) {
					Object.entries( value ).forEach( ( [ endpoint, endpointResponse ] ) => {
						endpointCallback( componentName, key + '/' + endpoint, endpointResponse );
					} );
				} else {
					keyCallback( key, value );
				}
			} );
		} else if ( isQueryEmpty ) {
			// Handles situation when query empty.
			// EG: 'globals/typography'.
			Object.keys( response ).forEach( ( key ) => {
				endpointCallback( requestData.command, key, response[ key ] );
			} );
		} else {
			// Handles situation when query is not empty.
			keyCallback( requestData.endpoint, response );
		}
	}

	/**
	 *
	 * Receive from cache.
	 *
	 * @param {string} methodType
	 * @param {{}} requestData
	 *
	 * @return {(Promise|boolean)}
	 */
	receive( methodType, requestData ) {
		const endpoint = requestData.endpoint,
			data = this.storage.getItem( endpoint );

		if ( null !== data ) {
			return new Promise( async ( resolve ) => {
				resolve( JSON.parse( data ) );
			} );
		}

		return false;
	}

	/**
	 *
	 * Load data to cache
	 *
	 * @param {{}} requestData
	 * @param {{}} response
	 */
	load( requestData, response ) {
		const addCache = ( key, value ) => this.storage.setItem( key, JSON.stringify( value ) ),
			addCacheEndpoint = ( controller, endpoint, value ) => addCache( controller + '/' + endpoint, value );

		this.extractResponse( response, requestData, addCache, addCacheEndpoint );
	}

	/**
	 *
	 * Update only exist storage.
	 *
	 * @param {{}} requestData
	 * @return {boolean}
	 */
	update( requestData ) {
		const endpoint = requestData.endpoint;
		let response = {};

		// Simulate response from cache.
		Object.entries( this.storage.getAll() ).forEach( ( [ endpointKey, endpointValue ] ) => {
			if ( endpointKey === endpoint ) {
				// If requested endpoint matches current endpoint key.

				response = JSON.parse( endpointValue );

				// Merge response with `requestData.args.data`.
				response = Object.assign( response, requestData.args.data );
			} else if ( endpointKey.includes( endpoint ) ) {
				// If current cache is part of the endpoint ( Handle situations like 'globals/ ... ' ).

				let isResponseMerged = false;

				// Merge simulated response with `requestData.args.data`.
				Object.entries( requestData.args.data ).forEach( ( [ dataKey, dataValue ] ) => {
					if ( endpointKey.includes( dataKey + '/' ) ) {
						if ( 'object' === typeof dataValue ) {
							Object.entries( dataValue ).forEach( ( [ subKey, subValue ] ) => {
								if ( endpointKey === endpoint + '/' + dataKey + '/' + subKey ) {
									response[ endpointKey ] = subValue;
									isResponseMerged = true;
								}
							} );
						}
					}
				} );

				if ( ! isResponseMerged ) {
					throw Error( 'Cannot merge response.' );
				}
			}
		} );

		// If response not found
		if ( 0 === Object.values( response ).length ) {
			return false;
		}

		// Update cache.
		this.load( requestData, response );

		return true;
	}

	delete( endpoint ) {
		let result = false;

		Object.entries( this.storage.getAll() ).forEach( ( [ endpointKey, endpointValue ] ) => {
			if ( endpointKey === endpoint ) {
				this.storage.removeItem( endpoint );
				result = true;
			} else if ( endpointKey.includes( endpoint + '/' ) ) {
				// Handle situations like 'globals/ ... '.
				this.storage.removeItem( endpointKey );
				result = true;
			}
		} );

		return result;
	}
}
