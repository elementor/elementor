export default class Base {
	/**
	 * Hold all hooks that were created within this class.
	 *
	 * @type {Object[]}
	 */
	static hooks = [];

	/**
	 * Function getAll().
	 *
	 * Returns all hooks that were created within this class.
	 *
	 * @returns {Object[]}
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
			if ( ! this.conditioning( args[ 0 ] ) ) {
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
	 */
	method() {
		throw Error( 'method() must be implanted' );
	}

	/**
	 * Function hook().
	 *
	 * Returns the full command path to hook.
	 *
	 * @returns {String}
	 */
	hook() {
		throw Error( 'hook() must be implanted.' );
	}

	/**
	 * Function id().
	 *
	 * Returns command id for the hook (should be unique).
	 *
	 * @returns {String}
	 */
	id() {
		throw Error( 'id() must be implanted.' );
	}

	/**
	 * Function conditioning().
	 *
	 * Condition for apply.
	 *
	 * @param {{}} args
	 *
	 * @returns {Boolean}
	 */
	conditioning( args ) {
		throw Error( 'conditioning() must be implanted.' );
	}

	/**
	 * Function apply().
	 *
	 * Apply the hook.
	 *
	 * @param {{}} args
	 *
	 * @returns {Boolean}
	 */
	apply( args ) {
		throw Error( 'apply() must be implanted.' );
	}
}
