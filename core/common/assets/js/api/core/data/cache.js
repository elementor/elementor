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

	load( requestData, response ) {
		const addCache = ( key, value ) => this.storage.setItem( key, JSON.stringify( value ) ),
			addCacheEndpoint = ( controller, endpoint, value ) => addCache( controller + '/' + endpoint, value );

		this.extractResponse( response, requestData, addCache, addCacheEndpoint );
	}

	receive( methodType, requestData ) {
		const endpoint = requestData.endpoint,
			data = this.storage.getItem( endpoint );

		if ( null !== data ) {
			return new Promise( async ( resolve ) => {
				resolve( JSON.parse( data ) );
			} );
		}
	}

	update( requestData ) {
		const endpoint = requestData.endpoint;

		let response = {};

		// Simulate response from cache.
		Object.entries( this.storage.getAll() ).forEach( ( [ key, value ] ) => {
			// If current cache is part of the endpoint.
			if ( key.includes( endpoint ) ) {
				let isResponseMerged = false;

				// Merge simulated response with `requestData.args.data`.
				Object.entries( requestData.args.data ).forEach( ( [ dataKey, dataValue ] ) => {
					if ( key.includes( dataKey + '/' ) ) {
						if ( 'object' === typeof dataValue ) {
							Object.entries( dataValue ).forEach( ( [ subKey, subValue ] ) => {
								if ( key === endpoint + '/' + dataKey + '/' + subKey ) {
									response[ key ] = subValue;
									isResponseMerged = true;
								}
							} );
						}
					}
				} );

				if ( ! isResponseMerged ) {
					debugger;
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
		return this.storage.removeItem( endpoint );
	}
}
