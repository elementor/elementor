export default class Base {
	/**
	 * Hold all hooks that were created within this class.
	 *
	 * @type {object[]}
	 */
	static hooks = [];

	/**
	 * Function getAll().
	 *
	 * Returns all hooks that were created within this class.
	 *
	 * @returns {object[]}
	 */
	static getAll() {
		return constructor.hooks;
	}

	/**
	 * Function constructor().
	 *
	 * Create hook base.
	 */
	constructor() {
		this.action = '';
		this.command = '';

		this.load();
	}

	/**
	 * Function load().
	 *
	 * Load the hook.
	 */
	load() {
		this.initialize();

		this.command = this.hook();
		this.id = this.id();

		const params = [ this.command, this.id, ( ... args ) => {
			if ( this.conditions( args[ 0 ] ) ) {
				if ( $e.devTools ) {
					// TODO: avoid of using `$e.devTools.log` do same as `$e.devTools.log.command()`
					// eg `$e.devTools.log.hook()`.
					$e.devTools.log.log( `%cHOOK ACTIVATED: ${ this.command }: ${ this.id } `,
						'font-weight: bold;color: #66ffcc' );
				}

				return this.apply( ... args );
			}

			return true;
		} ];

		// Save all hooks.
		this.constructor.hooks.push( {
			id: this.id,
			action: this.action,
			command: this.command,
			instance: this,
			params,
		} );

		this.method().apply( $e.hooks, params );
	}

	/**
	 * Function initialize().
	 *
	 * Called after creation of the base, used for initialize extras.
	 * Without expending constructor.
	 */
	initialize() {}

	/**
	 * Function method().
	 *
	 * Function should return `$e.hooks` register method.
	 *
	 * Example: 'return $e.hooks.registerDependency';
	 *
	 * @returns {function()}
	 *
	 * @throws {Errror}
	 */
	method() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function hook().
	 *
	 * Returns the full command path to hook.
	 *
	 * @returns {string}
	 *
	 * @throws {Error}
	 */
	hook() {
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
	conditions( args ) {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function apply().
	 *
	 * Apply the hook.
	 *
	 * @param {{}} args
	 *
	 * @returns {boolean}
	 */
	apply( args ) {
		elementorModules.ForceMethodImplementation();
	}
}
