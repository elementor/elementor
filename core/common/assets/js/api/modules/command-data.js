import CommandBase from './command-base';

export default class CommandData extends CommandBase {
	static getInstanceType() {
		return 'CommandData';
	}

	/**
	 * Function getEndpointFormat().
	 *
	 * @returns {(null|string)}
	 */
	static getEndpointFormat() {
		return null;
	}

	constructor( args, commandsAPI = $e.data ) {
		super( args, commandsAPI );

		this.requestData = this.getRequestData();
	}

	/**
	 * @param {DataTypes} type
	 *
	 * @returns {ApplyMethods}
	 */
	getApplyMethods( type = this.requestData.type ) {
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
			type: this.args.options?.type,
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
	 * @returns {Promise}
	 */
	apply() {
		const applyMethods = this.getApplyMethods();

		// Run 'before' method.
		this.args = applyMethods.before();

		let result = $e.data.args.useBulk && 'get' === this.requestData.type ?
				$e.data.bulk.fetch( this.requestData ) : $e.data.fetch( this.requestData );

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
