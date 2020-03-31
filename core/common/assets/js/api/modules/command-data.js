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
		const type = this.args.query.type,
			applyMethods = this.getApplyMethods( type );

		this.args = applyMethods.before( this.args );

		// TODO: Figure out which `requestData` is not in use and delete it.
		const requestData = {
			type,
			timestamp: new Date().getTime(),
			command: this.currentCommand,
			args: this.args,
		};

		return $e.utils.data.fetch( type, requestData ).then( ( data ) => {
			this.data = data;

			// Run apply filter.
			this.data = applyMethods.after( data, this.args );

			this.data = { data: this.data };

			// Append requestData.
			this.data = Object.assign( { __requestData__: requestData }, this.data );

			return this.data;
		} ).catch( ( e ) => {
			this.onCatchApply( e );
		} );
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
