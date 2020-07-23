import CommandBase from './command-base';

export default class CommandData extends CommandBase {
	/**
	 * Fetch type.
	 *
	 * @type {DataTypes}
	 */
	type;

	static getInstanceType() {
		return 'CommandData';
	}

	constructor( args, commandsAPI = $e.data ) {
		super( args, commandsAPI );

		if ( this.args.options?.type ) {
			this.type = this.args.options.type;
		}
	}

	/**
	 * Function getEndpointFormat().
	 *
	 * @returns {(null|string)}
	 */
	static getEndpointFormat() {
		return null;
	}

	/**
	 * @param {DataTypes} type
	 *
	 * @returns {ApplyMethods}
	 */
	getApplyMethods( type = this.type ) {
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

		return {
			before: () => before.apply( this, [ this.args ] ),
			after: ( response ) => after.apply( this, [ response, this.args ] ),
		};
	}

	/**
	 * Function getRequestData().
	 *
	 * @param {ApplyMethods} applyMethods
	 *
	 * @returns {RequestData}
	 */
	getRequestData( applyMethods ) {
		return {
			type: this.type,
			args: this.args,
			timestamp: new Date().getTime(),
			component: this.component,
			command: this.currentCommand,
			endpoint: $e.data.commandToEndpoint( this.currentCommand, elementorCommon.helpers.cloneObject( this.args ), this.constructor.getEndpointFormat() ),
			applyMethods,
		};
	}

	/**
	 * @inheritDoc
	 * @returns {Promise} promise or data
	 */
	apply() {
		const applyMethods = this.getApplyMethods();

		// Run 'before' method.
		this.args = applyMethods.before();

		const requestData = this.getRequestData( applyMethods );

		let result = $e.data.args.useBulk && 'get' === this.type ?
			$e.data.bulk.fetch( requestData ) : $e.data.fetch( requestData );

		if ( ! ( result instanceof Promise ) ) {
			result = new Promise( ( resolve ) => resolve( result ) );
		}

		result.catch( ( e ) => this.onCatchApply( e ) );

		return result;
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
