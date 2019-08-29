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
	 * Function requireElements().
	 *
	 * Validate `arg.element` & `arg.elements`.
	 *
	 * @param {{}} args
	 *
	 * @throws Error
	 */
	requireElements( args = this.args ) {
		if ( ! args.element && ! args.elements ) {
			throw Error( 'element or elements are required.' );
		}

		if ( args.element && args.elements ) {
			throw Error( 'element and elements cannot go together please select one of them.' );
		}
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
	 * @todo make function accept multi property.
	 */
	requireArgument( property, args = this.args ) {
		if ( ! args.hasOwnProperty( property ) ) {
			throw Error( `${ property } is required.` );
		}
	}

	once() {

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
		throw Error( 'getHistory() cannot return null, please provide getHistory functionality.' );
	}

	/**
	 * Function isDataChanged().
	 *
	 * should set editor change flag on?.
	 *
	 * returns {Boolean}
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

		const result = this.apply( this.args );

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
