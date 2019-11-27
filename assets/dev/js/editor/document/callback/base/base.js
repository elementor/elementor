export default class CallbackBase {
	/**
	 * Callback type, eg ( hook, event ).
	 *
	 * @type {string}
	 */
	type;

	/**
	 * Full command address, that will hook the callback.
	 *
	 * @type ([].string|string)
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

		this.register();
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
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function getType().
	 *
	 * Get type eg: ( hook, event, etc ... ).
	 *
	 * @returns {string}
	 *
	 * @throws {Error}
	 */
	getType() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function getCommand().
	 *
	 * Returns the full command path for callback binding.
	 *
	 * Supports array of strings ( commands ).
	 *
	 * @returns {([].string|string)}
	 *
	 * @throws {Error}
	 */
	getCommand() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function getId().
	 *
	 * Returns command id for the hook (should be unique).
	 *
	 * @returns {string}
	 *
	 * @throws {Error}
	 */
	getId() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function getConditions().
	 *
	 * Condition for running the callback, if true, call to apply().
	 *
	 * @param {{}} args
	 *
	 * @returns {boolean}
	 *
	 * @throws {Error}
	 */
	getConditions( args ) { // eslint-disable-line no-unused-vars
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function apply().
	 *
	 * Apply the callback, ( The actual affect of the callback ).
	 *
	 * @param {{}} args
	 *
	 * @returns {boolean}
	 */
	apply( args ) { // eslint-disable-line no-unused-vars
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function run().
	 *
	 * Run the callback.
	 *
	 * @param {*} args
	 *
	 * @returns {boolean}
	 */
	run( ... args ) {
		const { options = {} } = args[ 0 ];

		// Disable callback if requested by args.options.
		if ( options.callbacks && false === options.callbacks[ this.id ] ) {
			return true;
		}

		if ( this.getConditions( args[ 0 ] ) ) {
			if ( $e.devTools ) {
				$e.devTools.log.callbacks().active( this.type, this.command, this.id );
			}

			return this.apply( ... args );
		}

		return true;
	}
}
