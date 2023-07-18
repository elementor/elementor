import ArgsObject from 'elementor-assets-js/modules/imports/args-object';
import Deprecation from 'elementor-api/utils/deprecation';

/**
 * @typedef {import('../modules/component-base')} ComponentBase
 */

export default class CommandInfra extends ArgsObject {
	/**
	 * @type {Object}
	 */
	static registerConfig = null;

	static getInstanceType() {
		return 'CommandInfra';
	}

	/**
	 * Get info of command.
	 *
	 * @return {Object} Extra information about the command.
	 */
	static getInfo() {
		return {};
	}

	/**
	 * @return {string} Self command name.
	 */
	static getCommand() {
		return this.registerConfig.command;
	}

	/**
	 * @return {ComponentBase} Self component
	 */
	static getComponent() {
		return this.registerConfig.component;
	}

	static setRegisterConfig( config ) {
		this.registerConfig = Object.freeze( config );
	}

	/**
	 * @deprecated since 3.7.0, use `this.command` instead.
	 */
	get currentCommand() {
		Deprecation.deprecated( 'this.currentCommand', '3.7.0', 'this.command' );

		return this.command;
	}

	/**
	 * Function constructor().
	 *
	 * Create Commands Base.
	 *
	 * @param {{}} args
	 */
	constructor( args = {} ) {
		super( args );

		if ( ! this.constructor.registerConfig ) {
			throw RangeError( 'Doing it wrong: Each command type should have `registerConfig`.' );
		}

		// Acknowledge self about which command it run.
		this.command = this.constructor.getCommand();

		// Assign instance of current component.
		this.component = this.constructor.getComponent();

		// Who ever need do something before without `super` the constructor can use `initialize` method.
		this.initialize( args );

		// Refresh args, maybe the changed via `initialize`.
		args = this.args;

		// Validate args before run.
		this.validateArgs( args );
	}

	/**
	 * Function initialize().
	 *
	 * Initialize command, called after construction.
	 *
	 * @param {{}} args
	 */
	initialize( args = {} ) {} // eslint-disable-line no-unused-vars

	/**
	 * Function validateArgs().
	 *
	 * Validate command arguments.
	 *
	 * @param {{}} args
	 */
	validateArgs( args = {} ) {} // eslint-disable-line no-unused-vars

	// eslint-disable-next-line jsdoc/require-returns-check
	/**
	 * Function apply().
	 *
	 * Do the actual command.
	 *
	 * @param {{}} args
	 *
	 * @return {*} Command results.
	 */
	apply( args = {} ) { // eslint-disable-line no-unused-vars
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function run().
	 *
	 * Run command with history & hooks.
	 *
	 * @return {*} Command results.
	 */
	run() {
		return this.apply( this.args );
	}

	/**
	 * Function onBeforeRun.
	 *
	 * Called before run().
	 *
	 * @param {{}} args
	 */
	onBeforeRun( args = {} ) {} // eslint-disable-line no-unused-vars

	/**
	 * Function onAfterRun.
	 *
	 * Called after run().
	 *
	 * @param {{}} args
	 * @param {*}  result
	 */
	onAfterRun( args = {}, result ) {} // eslint-disable-line no-unused-vars

	/**
	 * Function onBeforeApply.
	 *
	 * Called before apply().
	 *
	 * @param {{}} args
	 */
	onBeforeApply( args = {} ) {} // eslint-disable-line no-unused-vars

	/**
	 * Function onAfterApply.
	 *
	 * Called after apply().
	 *
	 * @param {{}} args
	 * @param {*}  result
	 */
	onAfterApply( args = {}, result ) {} // eslint-disable-line no-unused-vars

	/**
	 * Function onCatchApply.
	 *
	 * Called after apply() failed.
	 *
	 * @param {Error} e
	 */
	onCatchApply( e ) {} // eslint-disable-line no-unused-vars
}
