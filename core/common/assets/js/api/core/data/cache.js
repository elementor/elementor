import ArgsObject from 'elementor-assets-js/modules/imports/args-object';
import LocalStorage from './stroages/local-storage';

export default class Cache extends ArgsObject {
	/**
	 * Function constructor().
	 *
	 * Create cache.
	 *
	 * @param {Data} manager
	 */
	constructor( manager ) {
		super( {} );

		this.manager = manager;

		this.storage = new LocalStorage();
	}

	/**
	 * Function validateRequestData().
	 *
	 * @param {RequestData} requestData
	 */
	validateRequestData( requestData ) {
		this.requireArgument( 'component', requestData );
		this.requireArgumentType( 'command', 'string', requestData );
		this.requireArgumentType( 'endpoint', 'string', requestData );
	}

	/**
	 * Function receive().
	 *
	 * Receive from cache. the difference between receive() and get() is that receive return it as promise...
	 * to fake fetch mechanism.
	 *
	 * @param {RequestData} requestData
	 *
	 * @return {(Promise|boolean)}
	 */
	receive( requestData ) {
		this.validateRequestData( requestData );

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
	 * Function load().
	 *
	 * Load data to cache.
	 *
	 * The difference between load() and update() is that load, will modify the data anyway...
	 * when update() will only modify exist objects/values.
	 *
	 * @param {RequestData} requestData
	 * @param {*} data
	 */
	load( requestData, data ) {
		this.validateRequestData( requestData );

		const componentName = requestData.component.getNamespace(),
			nakedEndpoint = requestData.endpoint.replace( componentName + '/', '' ),
			nakedEndpointParts = nakedEndpoint.split( '/' );

		let newData = {};

		// Example of working with reaming endpoint part(s) at 'cache.spec.js' test: 'load(): deep'.
		// Analyze reaming endpoint.
		if ( nakedEndpointParts.length && nakedEndpoint !== componentName ) {
			// Using reaming endpoint parts, to build new data object.
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
		const componentName = requestData.component.getNamespace();

		let componentData = this.storage.getItem( componentName );

		if ( componentData !== null ) {
			componentData = JSON.parse( componentData );

			if ( componentName === requestData.endpoint ) {
				return componentData;
			}

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
		if ( 'object' !== typeof requestData.args.data ) {
			throw new Error( 'requestData.args.data object is excepted.' );
		}

		const endpoint = requestData.endpoint;
		let response = {};

		// Simulate response from cache.
		Object.entries( this.storage.getAll() ).forEach( ( [ endpointKey, /*string*/ endpointValue ] ) => {
			if ( endpointValue && endpoint.includes( endpointKey ) ) {
				// Assuming it is a specific endpoint.
				const oldData = JSON.parse( endpointValue ),
					nakedEndpoint = requestData.endpoint.replace( requestData.component.getNamespace() + '/', '' ),
					nakedEndpointParts = nakedEndpoint.split( '/' ),
					isComponentUpdate = 1 === nakedEndpointParts.length && endpointKey === requestData.endpoint && endpointKey === requestData.component.getNamespace();

				// Component update or specific update?
				if ( isComponentUpdate ) {
					response = jQuery.extend( true, oldData, requestData.args.data );
				} else {
					const oldSpecificData = nakedEndpointParts.reduce(
						( accumulator, nakedEndpointPart ) => accumulator[ nakedEndpointPart ], oldData
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
