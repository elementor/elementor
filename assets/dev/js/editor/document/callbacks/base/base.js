export default class Base {
	/**
	 * Function constructor().
	 *
	 * Create hook base.
	 */
	constructor() {
		this.initialize();

		this._type = this.type()
		this._command = this.command();
		this._id = this.id();

		const params = [ this._command, this._id, ( ... args ) => {
			const { options = {} } = args[ 0 ];

			// Disable hook if requested by args.options.
			if ( $e.hooks === this._type && options.hooks && false === options.hooks[ this._id ] ) {
				return true;
			}

			if ( this.conditions( args[ 0 ] ) ) {
				if ( $e.hooks === this._type && $e.devTools ) {
					$e.devTools.log.hookActive( this._command, this._id );
				}

				return this.apply( ... args );
			}

			return true;
		} ];

		this.method().apply( this._type, params );
	}

	/**
	 * Function initialize().
	 *
	 * Called after creation of the base, used for initialize extras.
	 * Without expending constructor.
	 */
	initialize() {}

	/**
	 * Function type().
	 *
	 * Callback mechanism ( $e.hooks, $e.events, etc... ).
	 *
	 * @returns {Object}
	 *
	 * @throws {Error}
	 */
	type() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function command().
	 *
	 * Returns the full command path for callback binding.
	 *
	 * @returns {string}
	 *
	 * @throws {Error}
	 */
	command() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function method().
	 *
	 * Function should return `$e.hooks` register method.
	 *
	 * Example: 'return $e.hooks.registerDependency';
	 *
	 * @returns {function()}
	 *
	 * @throws {Error}
	 */
	method() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function id().
	 *
	 * Returns command id for the hook (should be unique).
	 *
	 * @returns {string}
	 *
	 * @throws {Error}
	 */
	id() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function conditions().
	 *
	 * Condition for apply.
	 *
	 * @param {{}} args
	 *
	 * @returns {boolean}
	 *
	 * @throws {Error}
	 */
	conditions( args ) { // eslint-disable-line no-unused-vars
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function apply().
	 *
	 * Apply the callback.
	 *
	 * @param {{}} args
	 *
	 * @returns {boolean}
	 */
	apply( args ) { // eslint-disable-line no-unused-vars
		elementorModules.ForceMethodImplementation();
	}
}
