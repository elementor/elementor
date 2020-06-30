import ArgsObject from 'elementor-assets-js/modules/imports/args-object';
import Command from './command';

export default class CommandBase extends ArgsObject {
	static getInstanceType() {
		return 'CommandBase';
	}

	/**
	 * Current component.
	 *
	 * @type {Component}
	 */
	component;

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

		// TODO: is better to check if register process is done.
		// If not running, this is may be only during the register.
		if ( ! $e.commands.constructor.trace.length ) {
			// Validate 'Command-Base' extended by 'Command', only not for testing.
			if ( ! elementorCommonConfig.isTesting && -1 === this.instanceTypes.indexOf( Command.getInstanceType() ) ) {
				throw Error( `'${ CommandBase.getInstanceType() }' Class cannot be extended directly, use: '${ Command.getInstanceType() }'.` );
			}

			return;
		}

		// Acknowledge self about which command it run.
		this.currentCommand = commandsAPI.getCurrentLast();

		// Assign instance of current component.
		this.component = commandsAPI.getComponent( this.currentCommand );

		// Who ever need do something before without `super` the constructor can use `initialize` method.
		this.initialize( args );

		// Refresh args, maybe the changed via `initialize`.
		args = this.args;

		// Validate args before run.
		this.validateArgs( args );
	}

	/**
	 * Function requireContainer().
	 *
	 * Validate `arg.container` & `arg.containers`.
	 *
	 * @param {{}} args
	 *
	 * @throws {Error}
	 */
	requireContainer( args = this.args ) {
		if ( ! args.container && ! args.containers ) {
			throw Error( 'container or containers are required.' );
		}

		if ( args.container && args.containers ) {
			throw Error( 'container and containers cannot go together please select one of them.' );
		}

		const containers = args.containers || [ args.container ];

		containers.forEach( ( container ) => {
			this.requireArgumentInstance( 'container', elementorModules.editor.Container, { container } );
		} );
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
	onCatchApply( e ) {} // // eslint-disable-line no-unused-vars
}
