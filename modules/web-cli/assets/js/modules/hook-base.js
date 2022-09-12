import ForceMethodImplementation from '../utils/force-method-implementation';

export default class HookBase {
	/**
	 * Callback type, eg ( hook, event ).
	 *
	 * @type {string}
	 */
	type;

	/**
	 * Full command address, that will hook the callback.
	 *
	 * @type {string}
	 */
	command;

	/**
	 * Unique id of the callback.
	 *
	 * @type {string}
	 */
	id;

	/**
	 * Function constructor().
	 *
	 * Create callback base.
	 */
	constructor() {
		this.initialize();

		this.type = this.getType();
		this.command = this.getCommand();
		this.id = this.getId();
	}

	/**
	 * Function initialize().
	 *
	 * Called after creation of the base, used for initialize extras.
	 * Without expending constructor.
	 */
	initialize() {}

	/**
	 * Function register().
	 *
	 * Used to register the callback.
	 *
	 * @throws {Error}
	 */
	register() {
		ForceMethodImplementation();
	}

	// eslint-disable-next-line jsdoc/require-returns-check
	/**
	 * Function getType().
	 *
	 * Get type eg: ( hook, event, etc ... ).
	 *
	 * @return {string} type
	 *
	 * @throws {Error}
	 */
	getType() {
		ForceMethodImplementation();
	}

	// eslint-disable-next-line jsdoc/require-returns-check
	/**
	 * Function getCommand().
	 *
	 * Returns the full command path for callback binding.
	 *
	 * Supports array of strings ( commands ).
	 *
	 * @return {string} command
	 *
	 * @throws {Error}
	 */
	getCommand() {
		ForceMethodImplementation();
	}

	// eslint-disable-next-line jsdoc/require-returns-check
	/**
	 * Function getId().
	 *
	 * Returns command id for the hook (should be unique).
	 *
	 * @return {string} id
	 *
	 * @throws {Error}
	 */
	getId() {
		ForceMethodImplementation();
	}

	// eslint-disable-next-line jsdoc/require-returns-check
	/**
	 * Function getContainerType().
	 *
	 * Bind eContainer type to callback.
	 *
	 * Used to gain performance.
	 *
	 * @return {string} type
	 */
	getContainerType() {}

	/**
	 * Function getConditions().
	 *
	 * Condition for running the callback, if true, call to apply().
	 *
	 * @param {*} [args={}]
	 * @param {*} [result=*]
	 *
	 * @return {boolean} conditions
	 */
	getConditions( args = {}, result ) { // eslint-disable-line no-unused-vars
		return true;
	}

	// eslint-disable-next-line jsdoc/require-returns-check
	/**
	 * Function apply().
	 *
	 * Apply the callback, ( The actual affect of the callback ).
	 *
	 * @param {*} [args={}]
	 *
	 * @return {*} results
	 */
	apply( args ) { // eslint-disable-line no-unused-vars
		ForceMethodImplementation();
	}

	/**
	 * Function run().
	 *
	 * Run the callback.
	 *
	 * @param {*} args
	 *
	 * @return {*} results
	 */
	run( ... args ) {
		const { options = {} } = args[ 0 ];

		// Disable callback if requested by args.options.
		if ( options.callbacks && false === options.callbacks[ this.id ] ) {
			return true;
		}

		if ( this.getConditions( ... args ) ) {
			if ( $e.devTools ) {
				$e.devTools.log.callbacks().active( this.type, this.command, this.id );
			}

			return this.apply( ... args );
		}

		return true;
	}
}
