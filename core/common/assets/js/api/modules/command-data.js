import CommandBase from './command-base';

/**
 * @typedef {boolean|{before: (function(*=): {}), after: (function({}, *=): {})}} ApplyMethods
 */

export default class CommandData extends CommandBase {
	/**
	 * Data returned from remote.
	 *
	 * @type {*}
	 */
	data;

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

		return { before, after };
	}

	/**
	 * Function getRequestData().
	 *
	 * @returns {RequestData}
	 */
	getRequestData() {
		return {
			type: this.type,
			args: this.args,
			timestamp: new Date().getTime(),
			component: this.component,
			command: this.currentCommand,
			endpoint: $e.data.commandToEndpoint( this.currentCommand, elementorCommon.helpers.cloneObject( this.args ), this.constructor.getEndpointFormat() ),
		};
	}

	/**
	 * Function handleData().
	 *
	 * @param {ApplyMethods} applyMethods
	 * @param {RequestData} requestData
	 * @param {{}} data
	 *
	 * @returns {*}
	 */
	handleData( applyMethods, requestData, data ) {
		this.data = data;

		// Run 'after' method.
		this.data = applyMethods.after.apply( this, [ data, this.args ] );

		this.data = { data: this.data };

		// Append requestData.
		this.data = Object.assign( { __requestData__: requestData }, this.data );

		return this.data;
	}

	apply() {
		const applyMethods = this.getApplyMethods();

		// Run 'before' method.
		this.args = applyMethods.before.apply( this, [ this.args ] );

		const requestData = this.getRequestData();

		this.data = this.getPreventDefaults();

		if ( null !== this.data ) {
			return this.handleData( applyMethods, requestData, this.data );
		}

		const promise = $e.data.args.useBulk && 'get' === this.type ?
			$e.data.bulk.fetch( requestData ) : $e.data.fetch( requestData );

		promise.then( ( data ) => this.handleData( applyMethods, requestData, data ) )
			.catch( ( e ) => this.onCatchApply( e ) );

		return promise;
	}

	/**
	 * Function getPreventDefaults.
	 *
	 * By defaults returns: 'null' means it will be skipped ( no prevent defaults ), anything except 'null' will triggered by apply(), to prevent the defaults.
	 * The result from 'getPreventDefaults' will be the result of the command.
	 *
	 * @returns {null|*}
	 */
	getPreventDefaults() {
		return null;
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
