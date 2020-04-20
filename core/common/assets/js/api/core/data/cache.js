import LocalStorage from './stroages/local-storage';

export default class Cache {
	constructor( manager ) {
		this.manager = manager;

		this.storage = new LocalStorage();
	}

	load( method, requestData, response ) {
		switch ( method ) {
			case 'GET': {
				const componentName = requestData.component?.getNamespace(),
					isIndexCommand = requestData.endpoint + '/index' === requestData.command,
					isQueryEmpty = 0 === Object.values( requestData.args.query ).length,

					addCache = ( key, value ) => this.storage.setItem( key, JSON.stringify( value ) ),
					addCacheEndpoint = ( controller, endpoint, value ) => addCache( controller + '/' + endpoint, value );

				if ( isQueryEmpty && isIndexCommand ) {
					// Handles situation when 'index' was forced to use like in 'globals' component.
					// EG: 'globals/index'.
					Object.entries( response ).forEach( ( [ key, value ] ) => {
						if ( 'object' === typeof value ) {
							Object.entries( value ).forEach( ( [ endpoint, endpointResponse ] ) => {
								addCacheEndpoint( componentName, key + '/' + endpoint, endpointResponse );
							} );
						} else {
							throw Error( `Invalid type: '${ value }'` );
						}
					} );
				} else if ( isQueryEmpty ) {
					// Handles situation when query empty.
					// EG: 'globals/typography'.
					Object.keys( response ).forEach( ( key ) => {
						addCacheEndpoint( requestData.command, key, response[ key ] );
					} );
				} else {
					// Handles situation when query is not empty.
					addCache( requestData.endpoint, response );
				}
			}
			break;

			default:
				throw Error( `Invalid method: '${ method }'` );
		}
	}

	receive( methodType, endpoint ) {
		switch ( methodType ) {
			case 'get': {
				const data = this.storage.getItem( endpoint );

				if ( null !== data ) {
					return new Promise( async ( resolve ) => {
						resolve( JSON.parse( data ) );
					} );
				}
			}
			break;

			default:
				throw Error( `Invalid method: '${ methodType }'` );
		}

		return false;
	}

	delete( endpoint ) {
		return this.storage.removeItem( endpoint );
	}
}
