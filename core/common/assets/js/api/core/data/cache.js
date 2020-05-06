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
	 * Function extractData().
	 *
	 * Extract data to callback that accept key,value parameters, based on requestData, and data.
	 *
	 * @param {*} data
	 * @param {RequestData} requestData
	 * @param {function( string, any )} keyValueCallback - callback(key, value)
	 * @param {('filter-object-component'|'filter-object'|'filter-key-value')} [filter]
	 */
	extractData( data, requestData, keyValueCallback, filter ) {
		if ( ! filter ) {
			filter = requestData.args.options?.filter;
		}

		switch ( filter ) {
			case 'filter-object-component': {
				Object.entries( data ).forEach( ( [ key, /*object*/ value ] ) => {
					const componentName = requestData.component?.getNamespace();

					if ( ! componentName ) {
						throw new Error( 'requestData.component is invalid.' );
					}

					if ( 'object' === typeof value && ! key.includes( componentName + '/' ) ) {
						Object.entries( value ).forEach( ( [ subKey, subKeyValue ] ) => {
							keyValueCallback( componentName + '/' + key + '/' + subKey, subKeyValue );
						} );
					} else if ( key.split( '/', 2 ).length > 1 ) {
							keyValueCallback( key, value );
						} else {
							keyValueCallback( componentName + '/' + key, value );
						}
				} );
			}
			break;

			case 'filter-object': {
				Object.keys( data ).forEach( ( key ) => {
					keyValueCallback( requestData.command + '/' + key, data[ key ] );
				} );
			}
			break;

			case 'filter-key-value': {
				keyValueCallback( requestData.endpoint, data );
			}
			break;

			// Try guess.
			default:
				const isIndexCommand = requestData.endpoint + '/index' === requestData.command,
					isQueryEmpty = 0 === Object.values( requestData.args.query ).length,
					endpointDepth = requestData.endpoint.split( '/', 3 ).length;

				if ( isQueryEmpty ) {
					if ( isIndexCommand ) {
						// Handles situation when 'index' was forced to use like in 'globals' component.
						// EG: 'globals/index'.
						this.extractData( data, requestData, keyValueCallback, 'filter-object-component' );
					} else if ( endpointDepth > 2 ) {
						// Handle situations when endpoint is exactly the path to the specific data.
						// EG: 'globals/typography/primary'.
						this.extractData( data, requestData, keyValueCallback, 'filter-key-value' );
					} else if ( 'object' === typeof data ) {
						// Handles situation when data is part of the command.
						// EG: 'globals/typography'.
						this.extractData( data, requestData, keyValueCallback, 'filter-object' );
					} else if ( 1 === endpointDepth && 'object' !== typeof data ) {
						this.extractData( data, requestData, keyValueCallback, 'filter-key-value' );
					} else {
						throw new RangeError( 'extractData out of range, cannot guesses filter type' );
					}
				} else {
					// Handles situation when query is not empty and need to point the endpoint is equal to the data.
					this.extractData( data, requestData, keyValueCallback, 'filter-key-value' );
				}
		}
	}

	/**
	 * Function receive().
	 *
	 * Receive from cache.
	 *
	 * @param {RequestData} requestData
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
	 * @param {RequestData} requestData
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
	 * @param {RequestData} requestData
	 *
	 * @return {{}}
	 */
	get( requestData ) {
		return JSON.parse( this.storage.getItem( requestData.endpoint ) );
	}

	/**
	 * Function update().
	 *
	 * Update only already exist storage, runs over all storage, do two cases, key-value update and situations like 'globals/ ... '.
	 * 1. If the current endpointKey is equal to requestData.endpoint.
	 * 2. If the current endpointKey is part of requestData.endpoint ( part of including '/' ) and requestData.args.data
	 * is object, using requestData.args.data keys to preform a validation if current endpoint + '/' + dataKey + '/' + subKey equals to requestedData.endpoint.
	 *
	 * @param {RequestData} requestData
	 *
	 * @return {boolean} is updated
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
				// Merge simulated response with `requestData.args.data`.
				Object.entries( requestData.args.data ).forEach( ( [ dataKey, /*object*/ dataValue ] ) => {
					if ( 'object' === typeof dataValue ) {
						if ( endpointKey.includes( dataKey + '/' ) ) {
							Object.entries( dataValue ).forEach( ( [ subKey, subValue ] ) => {
								if ( endpointKey === endpoint + '/' + dataKey + '/' + subKey ) {
									response[ endpointKey ] = subValue;
								}
							} );
						}
					} else {
						response[ endpointKey ] = dataValue;
					}
				} );
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
