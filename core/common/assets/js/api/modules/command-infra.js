import ArgsObject from 'elementor-assets-js/modules/imports/args-object';

export default class CommandInfra extends ArgsObject {
	static registerConfig = {};

	static getInstanceType() {
		return 'CommandInfra';
	}

	/**
	 * Get info of command.
	 *
	 * Use to provide 'extra' information about the command.
	 *
	 * @returns {Object}
	 */
	static getInfo() {
		return {};
	}

	/**
	 * Self command name.
	 *
	 * @returns {string}
	 */
	static getCommand() {
		return this.registerConfig.__command;
	}

	/**
	 * Self component.
	 *
	 * @returns {ComponentBase}
	 */
	static getComponent() {
		return this.registerConfig.__component;
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

		if ( 0 === Object.keys( this.constructor.registerConfig ).length ) {
			throw RangeError( 'Doing it wrong: command should be have registerConfig.' );
		}

		if ( 0 === $e.commands.constructor.trace.length ) {
			// Should be something like doingItWrong().
			throw RangeError( 'Doing it wrong: cannot register commands while running them.' );
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
	onCatchApply( e ) {} // eslint-disable-line no-unused-vars
}
