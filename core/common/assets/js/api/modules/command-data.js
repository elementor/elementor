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

		this.args = methodBefore( this.args );

		const requestData = {
				method,
				command: this.currentCommand,
				component: this.component.getNamespace(),
				timestamp: new Date().getTime(),
			},
			deferred = jQuery.Deferred();

		elementorCommon.ajax.addRequest( 'command-data', {
			data: requestData,
			error: ( ( e ) => {
				this.onCatchApply( e );

				deferred.reject();
			} ),
			success: ( ( data ) => {
				this.data = data;

				// Run apply filter.
				this.data = methodAfter( data, this.args );

				// Append requestData.
				this.data = Object.assign( { requestData }, this.data );

				deferred.resolve( this.data );
			} ),
		} );

		return deferred.promise();
	}
}
