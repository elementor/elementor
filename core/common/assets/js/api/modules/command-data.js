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

		delete this.args.dataType;

		this.args = methodBefore( this.args );

		return new Promise( ( resolve, reject ) => {
			elementorCommon.ajax.addRequest( 'command-data', {
				data: {
					command: this.currentCommand,
					component: this.component.getNamespace(),
				},
				error: ( e ) => {
					this.onCatchApply( e );

					reject( e );
				},
				success: ( data ) => {
					this.data = methodAfter( data, this.args );

					return this.data;
				},
			} );
		} );
	}
}
