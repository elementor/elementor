import ArgsObject from 'elementor-assets-js/modules/imports/args-object';

export default class CommandBase extends ArgsObject {
	static registerArgs = {};

	static getInstanceType() {
		return 'CommandBase';
	}

	/**
	 * Self command name.
	 *
	 * @returns {string}
	 */
	static getCommand() {
		return this.registerArgs.__command;
	}

	/**
	 * Self component.
	 *
	 * @returns {ComponentBase}
	 */
	static getComponent() {
		return this.registerArgs.__component;
	}

	/**
	 * Function constructor().
	 *
	 * Create Commands Base.
	 *
	 * @param [args={}]
	 * @param [commandsAPI={}]
	 */
	constructor( args = {}, commandsAPI = $e.commands ) {
		super( args );

		if ( $e.components.isRegistering ) {
			this.constructor.registerArgs = args;

			return;
		}

		if ( 0 === $e.commands.constructor.trace.length && ! $e.components.isRegistering ) {
			// Should be something like doingItWrong().
			throw RangeError( 'Doing it wrong: $e.components.isRegistering is false while $e.commands.constructor.trace.length is empty' );
		}

		// Acknowledge self about which command it run.
		this.command = this.constructor.getCommand() || commandsAPI.getCurrentLast();

		// Assign instance of current component.
		this.component = this.constructor.getComponent() || commandsAPI.getComponent( this.command );

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
	 * @param [args={}]
	 */
	initialize( args = {} ) {} // eslint-disable-line no-unused-vars

	/**
	 * Function validateArgs().
	 *
	 * Validate command arguments.
	 *
	 * @param [args={}]
	 */
	validateArgs( args = {} ) {} // eslint-disable-line no-unused-vars

	/**
	 * Function apply().
	 *
	 * Do the actual command.
	 *
	 * @param [args={}]
	 *
	 * @returns {*}
	 */
	apply( args = {} ) { // eslint-disable-line no-unused-vars
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function run().
	 *
	 * Run command with history & hooks.
	 *
	 * @returns {*}
	 */
	run() {
		return this.apply( this.args );
	}

	/**
	 * Run all the catch hooks.
	 *
	 * @param {Error} e
	 */
	runCatchHooks( e ) {
		$e.hooks.runDataCatch( this.currentCommand, this.args, e );
		$e.hooks.runUICatch( this.currentCommand, this.args, e );
	}

	/**
	 * Function onBeforeRun.
	 *
	 * Called before run().
	 *
	 * @param [args={}]
	 */
	onBeforeRun( args = {} ) {} // eslint-disable-line no-unused-vars

	/**
	 * Function onAfterRun.
	 *
	 * Called after run().
	 *
	 * @param [args={}]
	 * @param [result={*}]
	 */
	onAfterRun( args = {}, result ) {} // eslint-disable-line no-unused-vars

	/**
	 * Function onBeforeApply.
	 *
	 * Called before apply().
	 *
	 * @param [args={}]
	 */
	onBeforeApply( args = {} ) {} // eslint-disable-line no-unused-vars

	/**
	 * Function onAfterApply.
	 *
	 * Called after apply().
	 *
	 * @param [args={}]
	 * @param [result={*}]
	 */
	onAfterApply( args = {}, result ) {} // eslint-disable-line no-unused-vars

	/**
	 * Function onCatchApply.
	 *
	 * Called after apply() failed.
	 *
	 * @param {Error} e
	 */
	onCatchApply( e ) {
		this.runCatchHooks( e );

		elementorCommon.helpers.consoleError( e );
	}
}
