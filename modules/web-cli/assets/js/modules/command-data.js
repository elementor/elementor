import CommandBase from './command-base';
import * as errors from '../core/data/errors/';

/**
 * @name $e.modules.CommandData
 */
/**
 * @typedef {('create'|'delete'|'get'|'update'|'options')} DataTypes
 */
/**
 * @typedef {{}} RequestData
 */
/**
 * @typedef {import('../core/data/errors/base-error')} BaseError
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
	 * @return {null|string} endpoint format
	 */
	static getEndpointFormat() {
		return null;
	}

	/**
	 * @param {DataTypes} type
	 *
	 * @return {boolean|{before: (function(*=): {}), after: (function({}, *=): {})}} apply methods
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

			case 'options':
				before = this.applyBeforeOptions;
				after = this.applyAfterOptions;
				break;

			default:
				return false;
		}

		return { before: before.bind( this ), after: after.bind( this ) };
	}

	/**
	 * Function getRequestData().
	 *
	 * @return {RequestData} request data
	 */
	getRequestData() {
		return {
			type: this.type,
			args: this.args,
			timestamp: new Date().getTime(),
			component: this.component,
			command: this.command,
			endpoint: $e.data.commandToEndpoint( this.command, JSON.parse( JSON.stringify( this.args ) ), this.constructor.getEndpointFormat() ),
		};
	}

	apply() {
		const applyMethods = this.getApplyMethods();

		// Run 'before' method.
		this.args = applyMethods.before( this.args );

		const requestData = this.getRequestData();

		return $e.data.fetch( requestData ).then( ( data ) => {
			this.data = data;

			// Run 'after' method.
			this.data = applyMethods.after( data, this.args );

			this.data = { data: this.data };

			// Append requestData.
			this.data = Object.assign( { __requestData__: requestData }, this.data );

			return this.data;
		} );
	}

	/**
	 * @param {*} [args={}]
	 * @return {{}} filtered args
	 */
	applyBeforeCreate( args = {} ) {
		return args;
	}

	/**
	 * @param {{}} data
	 * @param {*}  [args={}]
	 * @return {{}} filtered result
	 */
	applyAfterCreate( data, args = {} ) {// eslint-disable-line no-unused-vars
		return data;
	}

	/**
	 * @param {*} [args={}]
	 * @return {{}} filtered args
	 */
	applyBeforeDelete( args = {} ) {
		return args;
	}

	/**
	 * @param {{}} data
	 * @param {*}  [args={}]
	 * @return {{}} filtered result
	 */
	applyAfterDelete( data, args = {} ) {// eslint-disable-line no-unused-vars
		return data;
	}

	/**
	 * @param {*} [args={}]
	 * @return {{}} filtered args
	 */
	applyBeforeGet( args = {} ) {
		return args;
	}

	/**
	 * @param {{}} data
	 * @param {*}  [args={}]
	 * @return {{}} filtered result
	 */
	applyAfterGet( data, args = {} ) {// eslint-disable-line no-unused-vars
		return data;
	}

	/**
	 * @param {*} [args={}]
	 * @return {{}} filtered args
	 */
	applyBeforeUpdate( args = {} ) {
		return args;
	}

	/**
	 * @param {{}} data
	 * @param {*}  [args={}]
	 * @return {{}} filtered result
	 */
	applyAfterUpdate( data, args = {} ) {// eslint-disable-line no-unused-vars
		return data;
	}

	/**
	 * @param {*} [args={}]
	 * @return {{}} filtered args
	 */
	applyBeforeOptions( args = {} ) {
		return args;
	}

	/**
	 * @param {{}} data
	 * @param {*}  [args={}]
	 * @return {{}} filtered result
	 */
	applyAfterOptions( data, args = {} ) {// eslint-disable-line no-unused-vars
		return data;
	}

	/**
	 * @param {BaseError} e
	 */
	applyAfterCatch( e ) {
		e.notify();
	}

	onCatchApply( e ) {
		// TODO: If the errors that returns from the server is consistent remove the '?' from 'e'
		const httpErrorCode = e?.data?.status || 501;

		let dataError = Object.values( errors ).find(
			( error ) => error.getHTTPErrorCode() === httpErrorCode,
		);

		if ( ! dataError ) {
			dataError = errors.DefaultError;
		}

		e = dataError.create( e.message, e.code, e.data || [] );

		this.runCatchHooks( e );

		this.applyAfterCatch( e );
	}
}
