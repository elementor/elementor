/**
 * TODO: Should we do validate function in scenarios where args are are not required.
 * but should be validate?
 */
import ArgsObject from './../../../../modules/imports/args-object';

export default class Base extends ArgsObject {
	/**
	 * Current component (elementorModules.Module ).
	 *
	 * @type {{}}
	 */
	component = {};

	/**
	 * Function constructor().
	 *
	 * Create Commands Base.
	 *
	 * @param {{}} args
	 */
	constructor( args ) {
		super( args );

		// Acknowledge self about which command it run.
		this.currentCommand = $e.commands.getCurrent( 'document' );

		// Assign instance of current component.
		this.component = $e.commands.getComponent( this.currentCommand );

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
	validateArgs( args ) {} // eslint-disable-line no-unused-vars

	/**
	 * Function isDataChanged().
	 *
	 * Whether the editor needs to set change flag on/off.
	 *
	 * @returns {boolean}
	 */
	isDataChanged() {
		return false;
	}

	/**
	 * Function apply().
	 *
	 * Do the actual command.
	 *
	 * @param {{}} args
	 *
	 * @returns {*}
	 */
	apply( args ) { // eslint-disable-line no-unused-vars
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
		let result;

		// For $e.events.
		this.onBeforeRun( this.args );

		try {
			// For $e.hooks.
			this.onBeforeApply( this.args );

			result = this.apply( this.args );
		} catch ( e ) {
			this.onCatchApply( e );

			if ( e instanceof elementorModules.common.HookBreak ) {
				return false;
			}
		}

		// For $e.hooks.
		this.onAfterApply( this.args, result );

		if ( this.isDataChanged() ) {
			elementor.saver.setFlagEditorChange( true );
		}

		// For $e.events.
		this.onAfterRun( this.args, result );

		return result;
	}

	/**
	 * Function onBeforeRun.
	 *
	 * Called before run().
	 *
	 * @param {{}} args
	 */
	onBeforeRun( args ) {
		$e.events.runBefore( this.currentCommand, args );
	}

	/**
	 * Function onAfterRun.
	 *
	 * Called after run().
	 *
	 * @param {{}} args
	 * @param {*} result
	 */
	onAfterRun( args, result ) {
		$e.events.runAfter( this.currentCommand, args, result );
	}

	/**
	 * Function onBeforeApply.
	 *
	 * Called before apply().
	 *
	 * @param {{}} args
	 */
	onBeforeApply( args ) {
		$e.hooks.runDependency( this.currentCommand, args );
	}

	/**
	 * Function onAfterApply.
	 *
	 * Called after apply().
	 *
	 * @param {{}} args
	 * @param {*} result
	 */
	onAfterApply( args, result ) {
		$e.hooks.runAfter( this.currentCommand, args, result );
	}

	/**
	 * Function onCatchApply.
	 *
	 * Called after apply() failed.
	 *
	 * @param {Error} e
	 */
	onCatchApply( e ) {
		if ( $e.devTools ) {
			$e.devTools.log.error( e );
		}

		if ( ! ( e instanceof elementorModules.common.HookBreak ) ) {
			// eslint-disable-next-line no-console
			console.error( e );
		}
	}
}
