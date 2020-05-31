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
	 * Function getAsync().
	 *
	 * Receive from cache. the difference between getAsync() and get() is that receive return it as promise...
	 * to fake fetch mechanism.
	 *
	 * @param {RequestData} requestData
	 *
	 * @return {(Promise|boolean)}
	 */
	getAsync( requestData ) {
		const data = this.get( requestData );

		if ( null !== data ) {
			// If data comes from cache, add 'cache = hit' to requestData.
			requestData.cache = 'hit';

			return new Promise( async ( resolve ) => {
				resolve( data );
			} );
		}

		// TODO: Check if possible, always return promise and reject it.
		return false;
	}

	/**
	 * Function set().
	 *
	 * set data to cache.
	 *
	 * The difference between set() and update() is that set, will modify the data anyway...
	 * when update() will only modify exist objects/values.
	 *
	 * @param {RequestData} requestData
	 * @param {*} data
	 */
	set( requestData, data ) {
		$e.data.validateRequestData( requestData );

		const componentName = requestData.component.getNamespace(),
			pureEndpoint = requestData.endpoint.replace( componentName + '/', '' ),
			pureEndpointParts = pureEndpoint.split( '/' );

		let newData = {};

		// Example of working with reaming endpoint part(s) can be found at 'cache.spec.js' test: 'load(): deep'.
		// Analyze reaming endpoint.
		if ( pureEndpointParts.length && pureEndpoint !== componentName ) {
			// Using reaming endpoint parts, to build new data object.
			const result = pureEndpointParts.reduce( ( accumulator, pureEndpointPart ) => {
				accumulator[ pureEndpointPart ] = {};

				return accumulator[ pureEndpointPart ];
			}, newData );

			// 'result' is equal to 'newData' with a deeper pointer, build based on 'pureEndpointParts' ( will effect newData ).
			Object.assign( result, data );
		} else {
			newData = data;
		}

		let oldData = this.storage.getItem( componentName );

		// When have old data, merge it recursively with newData using jQuery.extend().
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
		$e.data.validateRequestData( requestData );

		const componentName = requestData.component.getNamespace();

		let componentData = this.storage.getItem( componentName );

		if ( componentData !== null ) {
			componentData = JSON.parse( componentData );

			if ( componentName === requestData.endpoint ) {
				return componentData;
			}

			// Example of working with reaming endpoint part(s) can be found at 'cache.spec.js' test: 'get(): complex'.
			// Analyze reaming endpoint (Using reduce over endpoint parts, build the right index).
			const pureEndpoint = requestData.endpoint.replace( requestData.component.getNamespace() + '/', '' ),
				pureEndpointParts = pureEndpoint.split( '/' ),
				result = pureEndpointParts.reduce( ( accumulator, endpointPart ) => {
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
		$e.data.validateRequestData( requestData, true );

		const endpoint = requestData.endpoint;
		let response = {};

		// Simulate response from cache.
		Object.entries( this.storage.getAll() ).forEach( ( [ endpointKey, /*string*/ endpointValue ] ) => {
			if ( endpointValue && endpoint.includes( endpointKey ) ) {
				// Assuming it is a specific endpoint.
				const oldData = JSON.parse( endpointValue ),
					pureEndpoint = requestData.endpoint.replace( requestData.component.getNamespace() + '/', '' ),
					pureEndpointParts = pureEndpoint.split( '/' ),
					isComponentUpdate = 1 === pureEndpointParts.length && endpointKey === requestData.endpoint && endpointKey === requestData.component.getNamespace();

				// Component update or specific update?
				if ( isComponentUpdate ) {
					response = jQuery.extend( true, oldData, requestData.args.data );
				} else {
					const oldSpecificData = pureEndpointParts.reduce(
						( accumulator, pureEndpointPart ) => accumulator[ pureEndpointPart ], oldData
					);

					response = jQuery.extend( true, oldSpecificData, requestData.args.data );
				}
			}
		} );

		// If response not found.
		if ( 0 === Object.values( response ).length ) {
			return false;
		}

		// Update cache.
		this.set( requestData, response );

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

		for ( const key in this.storage.getAll() ) {
			if ( key === endpoint ) {
				this.storage.removeItem( endpoint );
				result = true;
				break;
			}
		}

		return result;
	}
}
