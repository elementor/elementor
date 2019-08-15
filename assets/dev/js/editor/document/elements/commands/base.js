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
	}

	/**
	 * Function apply().
	 *
	 * Apply the actual command.
	 */
	apply() {}

	/**
	 * Function run().
	 *
	 * Handles apply.
	 *
	 * @returns {*}
	 */
	run() {
		return this.apply();
	}
}
