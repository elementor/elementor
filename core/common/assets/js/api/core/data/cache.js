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
			// If data comes from cache, add 'receiveCache' to requestData.
			requestData.receiveCache = true;

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
		if ( ! requestData.component ) {
			throw new Error( 'Invalid `requestData.component`, component is required.' );
		}

		const componentName = requestData.component.getNamespace(),
			nakedEndpoint = requestData.endpoint.replace( componentName + '/', '' ),
			nakedEndpointParts = nakedEndpoint.split( '/' );

		let newData = {};

		// Analyze reaming endpoint.
		if ( nakedEndpointParts.length && nakedEndpoint !== componentName ) {
			// Using reaming endpoint build new data object.
			const result = nakedEndpointParts.reduce( ( accumulator, nakedEndpointPart ) => {
				accumulator[ nakedEndpointPart ] = {};

				return accumulator[ nakedEndpointPart ];
			}, newData );

			// 'result' is equal to 'newData' with a deeper pointer, build based on 'nakedEndpointParts' ( will effect newData ).
			Object.assign( result, data );
		} else {
			newData = data;
		}

		let oldData = this.storage.getItem( componentName );

		if ( oldData !== null ) {
			oldData = JSON.parse( oldData );

			newData = jQuery.extend( true, oldData, newData );
		}

		this.storage.setItem( componentName, JSON.stringify( newData ) );
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
		const componentName = requestData.component.getNamespace();

		let componentData = this.storage.getItem( componentName );

		if ( componentData !== null ) {
			componentData = JSON.parse( componentData );
			// Using reduce over endpoint parts it build the right index.
			const nakedEndpoint = requestData.endpoint.replace( requestData.component.getNamespace() + '/', '' ),
				nakedEndpointParts = nakedEndpoint.split( '/' ),
				result = nakedEndpointParts.reduce( ( accumulator, endpointPart ) => {
					if ( accumulator && accumulator[ endpointPart ] ) {
						return accumulator[ endpointPart ];
					}
				}, componentData );

			// Since $e.data.cache.receive will reject only if null is the result.
			return result || null;
		}

		return null;
	}

	/**
	 * Function update().
	 *
	 * Update only already exist storage, runs over all storage
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
			// Is this component update or specific endpoint?
			if ( endpoint.includes( endpointKey ) ) {
				if ( requestData.component.getNamespace() === endpoint ) {
					// Update component.
					debugger;
				} else if ( endpointValue && 'object' === typeof requestData.args.data ) {
					// Assuming it is a specific endpoint.
					const oldData = JSON.parse( endpointValue ),
						nakedEndpoint = requestData.endpoint.replace( requestData.component.getNamespace() + '/', '' ),
						nakedEndpointParts = nakedEndpoint.split( '/' ),
						oldSpecificData = nakedEndpointParts.reduce( ( accumulator, nakedEndpointPart ) => accumulator[ nakedEndpointPart ], oldData );

					response = jQuery.extend( true, oldSpecificData, requestData.args.data );
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
