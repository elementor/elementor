import Container from '../../container/container';

export default class {
	/**
	 * Function constructor().
	 *
	 * Create Commands Base.
	 *
	 * @param {{}} args
	 */
	constructor( args ) {
		this.args = args;

		this.initialize();
		this.validateArgs( args );

		this.history = this.getHistory( args );
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
			if ( ! ( container instanceof Container ) ) {
				throw Error( 'container invalid instance.' );
			}
		} );
	}

	/**
	 * Function requireArgument().
	 *
	 * Validate property in args.
	 *
	 * @param {String} property
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
	 * @param {String} property
	 * @param {String} type
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
	 * @param {String} property
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
	 * @param {String} property
	 * @param {{}} type
	 * @param {{}} args
	 *
	 * @throws Error
	 *
	 */
	requireArgumentConstructor( property, type, args = this.args ) {
		this.requireArgument( property, args );

		if ( ( args[ property ].constructor !== type ) ) {
			throw Error( `${ property } invalid constructor type.` );
		}
	}

	/**
	 * Function initialize().
	 *
	 * Initialize command, called after construction.
	 *
	 */
	initialize() {

	}

	/**
	 * Function validateArgs().
	 *
	 * Validate command arguments.
	 *
	 * @param {{}} args
	 */
	validateArgs( args ) {

	}

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
	 * should set editor change flag on?.
	 *
	 * @returns {Boolean}
	 */
	isDataChanged() {
		return false;
	}

	/**
	 * Function apply().
	 *
	 * Apply the actual command.
	 *
	 * @param {{}}
	 */
	apply( args ) {

	}

	/**
	 * Function run().
	 *
	 * Run command.
	 *
	 * @returns {*}
	 */
	run() {
		let historyId = null;

		if ( this.history && elementor.history.history.getActive() ) {
			this.history = Object.assign( this.history, { returnValue: true } );

			historyId = $e.run( 'document/history/startLog', this.history );
		}

		let result;

		// Rollback history on failure.
		try {
			result = this.apply( this.args );
		} catch ( e ) {
			$e.run( 'document/history/deleteLog', { id: historyId } );
			//console.error( e );
			return false;
		}

		if ( historyId ) {
			$e.run( 'document/history/endLog', { id: historyId } );
		}

		if ( this.isDataChanged() ) {
			elementor.saver.setFlagEditorChange( true );
		}

		return result;
	}

	/**
	 * Function isHistoryActive().
	 *
	 * Return `elementor.history.history.getActive()`.
	 *
	 * @returns {Boolean}
	 */
	isHistoryActive() {
		return elementor.history.history.getActive();
	}
}
