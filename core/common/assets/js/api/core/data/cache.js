import LocalStorage from './stroages/local-storage';

export default class Cache {
	/**
	 * Function constructor().
	 *
	 * Create cache.
	 *
	 * @param {Data} manager
	 */
	constructor( manager ) {
		this.manager = manager;

		this.storage = new LocalStorage();
	}

	/**
	 * Function extractResponse().
	 *
	 * Extract response to callback that accept key,value parameters using requestData.
	 *
	 * @param {*} data
	 * @param {{}} requestData
	 * @param {function( string, any )} keyValueCallback - callback(key, value)
	 */
	extractData( data, requestData, keyValueCallback ) {
		const componentName = requestData.component?.getNamespace(),
			isIndexCommand = requestData.endpoint + '/index' === requestData.command,
			isQueryEmpty = 0 === Object.values( requestData.args.query ).length,
			isEndpointTwoLevelsDeep = 2 < requestData.endpoint.split( '/', 3 ).length;

		if ( isQueryEmpty && isIndexCommand ) {
			// Handles situation when 'index' was forced to use like in 'globals' component.
			// EG: 'globals/index'.
			Object.entries( data ).forEach( ( [ key, /*object*/ value ] ) => {
				if ( 'object' === typeof value ) {
					Object.entries( value ).forEach( ( [ endpoint, endpointResponse ] ) => {
						keyValueCallback( componentName + '/' + key + '/' + endpoint, endpointResponse );
					} );
				} else {
					keyValueCallback( key, value );
				}
			} );
		} else if ( isEndpointTwoLevelsDeep && isQueryEmpty ) {
			// Handles situation when query empty.
			// EG: 'globals/typography/primary'.
			keyValueCallback( requestData.endpoint, data );
		} else if ( isQueryEmpty && 'object' === typeof data ) {
			// Handles situation when query empty.
			// EG: 'globals/typography'.
			Object.keys( data ).forEach( ( key ) => {
				keyValueCallback( requestData.command + '/' + key, data[ key ] );
			} );
		} else {
			// Handles situation when query is not empty.
			keyValueCallback( requestData.endpoint, data );
		}
	}

	/**
	 * Function receive().
	 *
	 * Receive from cache.
	 *
	 * @param {{}} requestData
	 *
	 * @return {(Promise|boolean)}
	 */
	receive( requestData ) {
		const data = this.get( requestData );

		if ( null !== data ) {
			return new Promise( async ( resolve ) => {
				resolve( data );
			} );
		}

		// TODO: Check if possible, always return promise and reject it.
		return false;
	}

	/**
	 * Function load().
	 *
	 * Load data to cache
	 *
	 * @param {{}} requestData
	 * @param {*} data
	 */
	load( requestData, data ) {
		const addCache = ( key, value ) => this.storage.setItem( key, JSON.stringify( value ) );

		this.extractData( data, requestData, addCache );
	}

	/**
	 * Function get().
	 *
	 * Get from exist storage.
	 *
	 * @param {{}} requestData
	 *
	 * @return {{}}
	 */
	get( requestData ) {
		return JSON.parse( this.storage.getItem( requestData.endpoint ) );
	}

	/**
	 * Function update().
	 *
	 * Update only exist storage.
	 *
	 * @param {{}} requestData
	 *
	 * @return {boolean}
	 */
	update( requestData ) {
		const endpoint = requestData.endpoint;
		let response = {};

		// Simulate response from cache.
		Object.entries( this.storage.getAll() ).forEach( ( [ endpointKey, /*string*/ endpointValue ] ) => {
			if ( endpointKey === endpoint ) {
				// If requested endpoint matches current endpoint key.
				response = JSON.parse( endpointValue );

				// Check if response is same data type as args.data ( since update requested ).
				if ( typeof response !== typeof requestData.args.data ) {
					throw new Error( 'Invalid data: type mismatch' );
				}

				// Merge response with `requestData.args.data`.
				if ( 'object' === typeof response ) {
					response = Object.assign( response, requestData.args.data );
				} else {
					response = requestData.args.data;
				}
			} else if ( endpointKey.includes( endpoint ) ) {
				// If current cache is part of the endpoint ( Handle situations like 'globals/ ... ' ).
				let isResponseMerged = false;
				// Merge simulated response with `requestData.args.data`.
				Object.entries( requestData.args.data ).forEach( ( [ dataKey, /*object*/ dataValue ] ) => {
					if ( 'object' === typeof dataValue && endpointKey.includes( dataKey + '/' ) ) {
						Object.entries( dataValue ).forEach( ( [ subKey, subValue ] ) => {
							if ( endpointKey === endpoint + '/' + dataKey + '/' + subKey ) {
								response[ endpointKey ] = subValue;
								isResponseMerged = true;
							}
						} );
					}
				} );

				if ( ! isResponseMerged ) {
					throw Error( 'Cannot merge response.' );
				}
			}
		} );

		// If response not found.
		if ( 0 === Object.values( response ).length ) {
			return false;
		}

		// Update cache.
		this.load( requestData, response );

		return true;
	}

	/**
	 * Function delete().
	 *
	 * Delete endpoint from storage.
	 *
	 * @param {string} endpoint
	 *
	 * @return {boolean}
	 */
	delete( endpoint ) {
		let result = false;

		Object.keys( this.storage.getAll() ).forEach( ( endpointKey ) => {
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
