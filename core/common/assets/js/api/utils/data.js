// TODO: Return it from the server. Original at WP_REST_Server.
export const READABLE = [ 'GET' ],
	CREATABLE = [ 'POST' ],
	EDITABLE = [ 'POST', 'PUT', 'PATCH' ],
	DELETABLE = [ 'DELETE' ],
	ALLMETHODS = [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE' ];

export default class Data {
	getHTTPMethod( type ) {
		switch ( type ) {
			case 'create':
				return 'POST';

			case 'delete':
				return 'DELETE';

			case 'get':
				return 'GET';

			case 'update':
				return 'PUT';
		}

		return false;
	}

	getAllowedMethods( type ) {
		switch ( type ) {
			case 'create':
				return CREATABLE;

			case 'delete':
				return DELETABLE;

			case 'get':
				return READABLE;

			case 'update':
				return EDITABLE;
		}

		return false;
	}

	/**
	 * @param {string} type
	 * @param {string} command
	 * @param {{}} args
	 *
	 * @returns {string} Endpoint
	 */
	commandToEndpoint( type, command, args ) {
		let endPoint = command;

		if ( endPoint.includes( 'index' ) ) {
			endPoint = endPoint.replace( 'index', '' );
		}

		if ( args.id ) {
			endPoint += '/' + args.id.toString() + '/';

			delete args.id;
		}

		const argsEntries = Object.entries( args );

		// Upon 'GET' args will become part of get params.
		if ( 'get' === type && argsEntries.length ) {
			endPoint += '?';

			argsEntries.forEach( ( [ name, value ] ) => {
				endPoint += name + '=' + value + '&';
			} );
		}

		return endPoint;
	}

	fetch( type, requestData ) {
		// TODO: Check if 'include' is required.
		const params = {
				credentials: 'include', // cookies
			},
			headers = {};

		requestData.command = this.commandToEndpoint( type, requestData.command, requestData.args );

		/**
		 * Translate:
		 * 'create, delete, get, update' to HTTP Methods:
		 * 'GET, POST, PUT, PATCH, DELETE'
		 */
		const allowedMethods = this.getAllowedMethods( type ),
			method = this.getHTTPMethod( type );

		if ( 'GET' === method ) {
			Object.assign( params, { headers } );
		} else if ( allowedMethods ) {
			Object.assign( headers, { 'Content-Type': 'application/json' } );
			Object.assign( params, {
				method,
				headers: headers,
				body: JSON.stringify( requestData ),
			} );
		} else {
			throw Error( `Invalid type: '${ type }'` );
		}

		return new Promise( async ( resolve, reject ) => {
			const request = await window.fetch( elementor.config.home_url + '/wp-json/elementor/v1/' + requestData.command, params );

			try {
				// Ensure JSON.
				const response = await request.json();

				// Catch wp reset errors.
				if ( response.data && response.data.status && response.code ) {
					reject( response.message );

					return response;
				}

				resolve( response );
			} catch ( e ) {
				reject( e );
			}
		} );
	}
}
