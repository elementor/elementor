import ArgsObject from 'elementor-assets-js/modules/imports/args-object';

export default class CommandBase extends ArgsObject {
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
	constructor( args, commandsAPI = $e.commands ) {
		super( args );

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
		let result;

		// For UI Hooks.
		this.onBeforeRun( this.args );

		try {
			// For Data hooks.
			this.onBeforeApply( this.args );

			result = this.apply( this.args );
		} catch ( e ) {
			this.onCatchApply( e );

			if ( e instanceof $e.modules.HookBreak ) {
				return false;
			}
		}

		const onAfter = ( _result ) => {
			this.onAfterApply( this.args, _result );

			if ( this.isDataChanged() ) {
				$e.internal( 'document/save/set-is-modified', { status: true } );
			}

			// For UI hooks.
			this.onAfterRun( this.args, _result );
		};

		// TODO: Temp code determine if it's a jQuery deferred object.
		if ( result && 'object' === typeof result && result.promise && result.then && result.fail ) {
			result.fail( this.onCatchApply.bind( this ) );
			result.done( onAfter );
		} else {
			onAfter( result );
		}

		return result;
	}

	/**
	 * Function onBeforeRun.
	 *
	 * Called before run().
	 *
	 * @param [args={}]
	 */
	onBeforeRun( args = {} ) {
		$e.hooks.runUIBefore( this.currentCommand, args );
	}

	/**
	 * Function onAfterRun.
	 *
	 * Called after run().
	 *
	 * @param [args={}]
	 * @param [result={*}]
	 */
	onAfterRun( args = {}, result ) {
		$e.hooks.runUIAfter( this.currentCommand, args, result );
	}

	/**
	 * Function onBeforeApply.
	 *
	 * Called before apply().
	 *
	 * @param [args={}]
	 */
	onBeforeApply( args = {} ) {
		$e.hooks.runDataDependency( this.currentCommand, args );
	}

	/**
	 * Function onAfterApply.
	 *
	 * Called after apply().
	 *
	 * @param [args={}]
	 * @param [result={*}]
	 */
	onAfterApply( args = {}, result ) {
		$e.hooks.runDataAfter( this.currentCommand, args, result );
	}

	/**
	 * Function onCatchApply.
	 *
	 * Called after apply() failed.
	 *
	 * @param {Error} e
	 */
	onCatchApply( e ) {
		$e.hooks.runDataCatch( this.currentCommand, this.args, e );

		elementorCommon.helpers.consoleError( e );

		$e.hooks.runUICatch( this.currentCommand, this.args, e );
	}
}
