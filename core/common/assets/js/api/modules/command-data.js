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
		this.dataBefore = {};

		/**
		 * Data returned from remote.
		 *
		 * @type {{}}
		 */
		this.dataAfter = {};
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

		delete this.args.dataType;

		this.args = methodBefore( this.args );

		const requestData = {
				command: this.currentCommand,
				component: this.component.getNamespace(),
				timestamp: new Date().getTime(),
			},
			deferred = jQuery.Deferred();

		elementorCommon.ajax.addRequest( 'command-data', {
			data: requestData,
			error: ( e ) => {
				this.onCatchApply( e );
			},
			success: ( ( data ) => {
				this.dataBefore = data;

				this.dataAfter = methodAfter( data, this.args );
				this.dataAfter = Object.assign( { requestData }, this.dataAfter );

				deferred.resolve( this.dataAfter );
			} ).bind( this ),
		} );

		return deferred.promise();
	}
}
