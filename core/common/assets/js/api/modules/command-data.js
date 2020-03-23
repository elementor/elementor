import CommandBase from './command-base';

// TODO: Return it from the server. Original at WP_REST_Server.
const READABLE = [ 'GET' ],
	CREATABLE = [ 'POST' ],
	EDITABLE = [ 'POST', 'PUT', 'PATCH' ],
	DELETABLE = [ 'DELETE' ],
	ALLMETHODS = [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE' ];

export default class CommandData extends CommandBase {
	static getInstanceType() {
		return 'CommandData';
	}

	constructor( args, commandsAPI = $e.data ) {
		super( args, commandsAPI );

		/**
		 * Data returned from remote.
		 *
		 * @type {{}}
		 */
		this.data = {};
	}

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

	getApplyMethods( type ) {
		let before, after;
		switch ( type ) {
			case 'create':
				before = this.applyBeforeCreate;
				after = this.applyAfterCreate;
				break;

			case 'delete':
				before = this.applyBeforeDelete;
				after = this.applyAfterDelete;
				break;

			case 'get':
				before = this.applyBeforeGet;
				after = this.applyAfterGet;
				break;

			case 'update':
				before = this.applyBeforeUpdate;
				after = this.applyAfterUpdate;
				break;

			default:
				return false;
		}

		return { before, after };
	}

	apply() {
		const type = this.args.type,
			applyMethods = this.getApplyMethods( type );

		delete this.args.type;

		this.args = applyMethods.before( this.args );

		const deferred = jQuery.Deferred(),
			requestData = {
				method: type,
				command: this.currentCommand,
				component: this.component.getNamespace(),
				timestamp: new Date().getTime(),
			},
			params = {
				credentials: 'include', // cookies
			},
			headers = {};

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

		const response = fetch( elementor.config.home_url + '/wp-json/elementor/v1/' + requestData.command, params );

		try {
			response.then( ( _response ) => _response.json() ).then( ( data ) => {
				this.data = data;

				// Run apply filter.
				this.data = applyMethods.after( data, this.args );

				// Append requestData.
				this.data = Object.assign( { requestData }, this.data );

				deferred.resolve( this.data );
			} );
		} catch ( e ) {
			this.onCatchApply( e );

			deferred.reject();

			return false;
		}
		// //elementor.config.home_url
		// elementorCommon.ajax.addRequest( 'command-data', {
		// 	data: requestData,
		// 	error: ( ( e ) => {
		// 		this.onCatchApply( e );
		//
		// 		deferred.reject();
		// 	} ),
		// 	success: ( ( data ) => {
		// 		this.data = data;
		//
		// 		// Run apply filter.
		// 		this.data = methodAfter( data, this.args );
		//
		// 		// Append requestData.
		// 		this.data = Object.assign( { requestData }, this.data );
		//
		// 		deferred.resolve( this.data );
		// 	} ),
		// } );

		return deferred.promise();
	}

	/**
	 * @param [args={}]
	 * @returns {{}} filtered args
	 */
	applyBeforeCreate( args = {} ) {
		return args;
	}

	/**
	 * @param {{}} data
	 * @param [args={}]
	 * @returns {{}} filtered result
	 */
	applyAfterCreate( data, args = {} ) {
		return data;
	}

	/**
	 * @param [args={}]
	 * @returns {{}} filtered args
	 */
	applyBeforeDelete( args = {} ) {
		return args;
	}

	/**
	 * @param {{}} data
	 * @param [args={}]
	 * @returns {{}} filtered result
	 */
	applyAfterDelete( data, args = {} ) {
		return data;
	}

	/**
	 * @param [args={}]
	 * @returns {{}} filtered args
	 */
	applyBeforeGet( args = {} ) {
		return args;
	}

	/**
	 * @param {{}} data
	 * @param [args={}]
	 * @returns {{}} filtered result
	 */
	applyAfterGet( data, args = {} ) {
		return data;
	}

	/**
	 * @param [args={}]
	 * @returns {{}} filtered args
	 */
	applyBeforeUpdate( args = {} ) {
		return args;
	}

	/**
	 * @param {{}} data
	 * @param [args={}]
	 * @returns {{}} filtered result
	 */
	applyAfterUpdate( data, args = {} ) {
		return data;
	}
}
