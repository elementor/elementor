export default class Cache {
	constructor( manager ) {
		this.manager = manager;

		this.cache = {};
	}

	endpointToUniqueId( endpoint ) {
		/**
		 * Since `$e.data` uses  `args.query` to generate endpoint in `function commandToEndpoint`.
		 * The generated key should be the SUM of endpoint.
		 * TODO: Remove POC comment and create test for the function.
		 *  POC Comment:
		 * 	test = 0 ; 'endpoint?param_b=b?param_a=a'.split('').forEach( ( char ) => test = test + parseInt( char.charCodeAt(0) ) ) ; console.log( test )
		 * 	test = 0 ; 'endpoint?param_a=a?param_b=b'.split('').forEach( ( char ) => test = test + parseInt( char.charCodeAt(0) ) ) ; console.log( test )
		 * 	both result: 2751
		 */
		let result = 0;

		endpoint.split( '' ).forEach( ( char ) =>
			result = result + parseInt( char.charCodeAt( 0 ) )
		);

		return result.toString();
	}

	load( method, requestData, response ) {
		switch ( method ) {
			case 'GET': {
				const componentName = requestData?.component?.getNamespace(),
					isCommandGetItemId = requestData.command === componentName,
					isIndexCommand = requestData.endpoint + '/index' === requestData.command,
					isQueryEmpty = 0 === Object.values( requestData.args.query ).length,

					addCache = ( key, value ) => this.cache[ this.endpointToUniqueId( key ) ] = value,
					addCacheEndpoint = ( controller, endpoint, value ) => addCache( controller + '/' + endpoint, value );

				if ( isQueryEmpty && 1 === isCommandGetItemId ) {
					Object.keys( response ).forEach( ( key ) => {
						addCacheEndpoint( requestData.command, key, response[ key ] );
					} );
				} else if ( isQueryEmpty && isIndexCommand ) {
					// Handles situation when 'index' was forced to use like in 'globals' component.
					Object.entries( response ).forEach( ( [ key, value ] ) => {
						if ( 'object' === typeof value ) {
							Object.entries( value ).forEach( ( [ endpoint, endpointResponse ] ) => {
								addCacheEndpoint( componentName, key + '/' + endpoint, endpointResponse );
							} );
						} else {
							throw Error( `Invalid type: '${ value }'` );
						}
					} );
				} else {
					addCache( requestData.endpoint, response );
				}
			}
			break;

			default:
				throw Error( `Invalid method: '${ method }'` );
		}
	}

	fetch( methodType, requestData ) {
		switch ( methodType ) {
			case 'get': {
				const key = this.endpointToUniqueId( requestData.endpoint );

				if ( this.cache[ key ] ) {
					return new Promise( async ( resolve ) => {
						resolve( this.cache[ key ] );
					} );
				}
			}
			break;

			default:
				throw Error( `Invalid method: '${ methodType }'` );
		}

		return false;
	}
}
