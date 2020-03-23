import CommandBase from './command-base';

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

	apply() {
		let methodBefore, methodAfter;

		// EXTRACT
		switch ( this.args.dataType ) {
			case 'create':
				methodBefore = this.applyBeforeCreate;
				methodAfter = this.applyAfterCreate;
				break;

			case 'delete':
				methodBefore = this.applyBeforeDelete;
				methodAfter = this.applyAfterDelete;
				break;

			case 'get':
				methodBefore = this.applyBeforeGet;
				methodAfter = this.applyAfterGet;
				break;

			case 'update':
				methodBefore = this.applyBeforeUpdate;
				methodAfter = this.applyAfterUpdate;
				break;

			default:
				throw Error( `Invalid type: '${ this.args.type }'` );
		}

		const method = this.args.dataType;

		delete this.args.dataType;
		// EXTRACT

		this.args = methodBefore( this.args );

		const deferred = jQuery.Deferred(),
			requestData = {
				method,
				command: this.currentCommand,
				component: this.component.getNamespace(),
				timestamp: new Date().getTime(),
			},
			params = {
				credentials: 'include', // cookies
			},
			headers = {};

		if ( 'post' === method ) {
			Object.assign( headers, { 'Content-Type': 'application/json' } );
			Object.assign( params, {
				method: 'POST',
				headers: headers,
				body: JSON.stringify( requestData ),
			} );
		} else {
			Object.assign( params, { headers } );
		}

		const response = fetch( elementor.config.home_url + '/wp-json/elementor/v1/' + requestData.command, params );

		try {
			response.then( ( _response ) => _response.json() ).then( ( data ) => {
				this.data = data;

				// Run apply filter.
				this.data = methodAfter( data, this.args );

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
}
