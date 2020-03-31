export default class Cache {
	constructor( manager ) {
		this.manager = manager;

		this.cache = {};
	}

	response( method, requestData, response ) {
		switch ( method ) {
			case 'GET': {
				if ( 1 === Object.values( requestData.args.query ).length ) {
					Object.keys( response ).forEach( ( key ) => {
						const endpoint = requestData.command + '/' + key;

						this.cache[ endpoint ] = response[ key ];
					} );
				} else {
					this.cache[ requestData.endpoint ] = response;
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
				if ( this.cache[ requestData.endpoint ] ) {
					return new Promise( async ( resolve ) => {
						resolve( this.cache[ requestData.endpoint ] );
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
