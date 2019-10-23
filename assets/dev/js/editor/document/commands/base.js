export default class Base {
	/**
	 * Function constructor().
	 *
	 * Create Commands Base.
	 *
	 * @param {{}} args
	 */
	constructor( args ) {
		this.args = args;

		// Who ever need do something before without `super` the constructor can use `initialize` method.
		this.initialize();

		// Validate args before run.
		this.validateArgs( args );

		// Acknowledge self about which command it run.
		this.currentCommand = $e.commands.getCurrent( 'document' );

		// Get History from child command.
		this.history = this.getHistory( args );

		this.historyId = null;
	}

	/**
	 * Function requireContainer().
	 *
	 * Validate `arg.container` & `arg.containers`.
	 *
	 * @param {{}} args
	 *
	 * @throws Error
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
	 * Function requireArgument().
	 *
	 * Validate property in args.
	 *
	 * @param {string} property
	 * @param {{}} args
	 *
	 * @throws Error
	 *
	 */
	requireArgument( property, args = this.args ) {
		if ( ! args.hasOwnProperty( property ) ) {
			throw Error( `${ property } is required.` );
		}
	}

	/**
	 * Function requireArgumentType().
	 *
	 * Validate property in args using `typeof(args.whatever) === type`.
	 *
	 * @param {string} property
	 * @param {string} type
	 * @param {{}} args
	 *
	 * @throws Error
	 *
	 */
	requireArgumentType( property, type, args = this.args ) {
		this.requireArgument( property, args );

		if ( ( typeof args[ property ] !== type ) ) {
			throw Error( `${ property } invalid type: ${ type }.` );
		}
	}

	/**
	 * Function requireArgumentInstance().
	 *
	 * Validate property in args using `args.whatever instanceof instance`.
	 *
	 * @param {string} property
	 * @param {instanceof} instance
	 * @param {{}} args
	 *
	 * @throws Error
	 *
	 */
	requireArgumentInstance( property, instance, args = this.args ) {
		this.requireArgument( property, args );

		if ( ! ( args[ property ] instanceof instance ) ) {
			throw Error( `${ property } invalid instance.` );
		}
	}

	/**
	 * Function requireArgumentConstructor().
	 *
	 * Validate property in args using `args.whatever.constructor === type`.
	 *
	 * @param {string} property
	 * @param {{}} type
	 * @param {{}} args
	 *
	 * @throws Error
	 *
	 */
	requireArgumentConstructor( property, type, args = this.args ) {
		this.requireArgument( property, args );

		if ( args[ property ].constructor !== type ) {
			throw Error( `${ property } invalid constructor type.` );
		}
	}

	/**
	 * Function initialize().
	 *
	 * Initialize command, called after construction.
	 *
	 */
	initialize() {}

	/**
	 * Function validateArgs().
	 *
	 * Validate command arguments.
	 *
	 * @param {{}} args
	 */
	validateArgs( args ) {}

	/**
	 * Function getHistory().
	 *
	 * Gets specify history behavior.
	 *
	 * @param {{}} args
	 *
	 * @returns {{}|Boolean}
	 *
	 * @throws Error
	 */
	getHistory( args ) {
		throw Error( 'getHistory() should be implemented, please provide getHistory functionality.' );
	}

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
	 * @param {{}}
	 */
	apply( args ) {
		throw Error( 'apply() should be implemented, please provide apply functionality.' );
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

		if ( this.history && this.isHistoryActive() ) {
			this.historyId = $e.run( 'document/history/startLog', this.history );
		}

		this.onBeforeApply( this.args );

		try {
			$e.hooks.runDependency( this.currentCommand, this.args );

			result = this.apply( this.args );
		} catch ( e ) {
			// Rollback history on failure.
			if ( $e.devTools ) {
				$e.devTools.log.error( e );
			}

			if ( elementor.isTesting ) {
				console.error( e );
			}

			if ( this.historyId ) {
				$e.run( 'document/history/deleteLog', { id: this.historyId } );
			}

			return false;
		}

		this.onAfterApply( this.args );

		$e.hooks.runAfter( this.currentCommand, this.args, result );

		if ( this.historyId ) {
			$e.run( 'document/history/endLog', { id: this.historyId } );
		}

		if ( this.isDataChanged() ) {
			elementor.saver.setFlagEditorChange( true );
		}

		return result;
	}

	/**
	 * Function isHistoryActive().
	 *
	 * Return history status.
	 *
	 * @returns {boolean}
	 */
	isHistoryActive() {
		return elementor.documents.getCurrent().history.getActive();
	}

	/**
	 * Function onBeforeApply.
	 *
	 * Called before apply().
	 *
	 * @param {{}} args
	 */
	onBeforeApply( args ) {}

	/**
	 * Function onAfterApply.
	 *
	 * Called after apply().
	 *
	 * @param {{}} args
	 */
	onAfterApply( args ) {}
}
