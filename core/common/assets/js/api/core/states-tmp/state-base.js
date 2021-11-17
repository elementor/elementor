export default class StateBase {
	/**
	 * The state's current value.
	 *
	 * @var {*}
	 */
	current = this.default();

	/**
	 * List of subscribers callback.
	 *
	 * @type {{}}
	 */
	subscribers = {};

	constructor() {
		// Initial update of the state.
		this.update();
	}

	/**
	 * Default/initial state value.
	 *
	 * @returns {*}
	 */
	default() {
		return {};
	}

	/**
	 * Subscribe to state changes using a callback. When a selector function is specified, listen to changes to the
	 * selected value from state.
	 *
	 * @param {callback} callback
	 * @param {callback} selector
	 * @returns {*}
	 */
	subscribe( callback, selector = null ) {
		const identifier = elementor.helpers.getUniqueID();

		this.subscribers[ identifier ] = {
			callback,
			selector,
		};

		return identifier;
	}

	/**
	 * Unsubscribe from listening to state changes using the callback used in the time of subscribing, or the subscriber
	 * identifier.
	 *
	 * @param {callback|string} subscriber
	 */
	unsubscribe( subscriber ) {
		if ( subscriber instanceof Function ) {
			// Find identifiers of subscribers which have the given callback.
			Object.entries( this.subscribers ).filter(
				( [ , value ] ) => value.callback === subscriber
			).map(
				// Unsubscribe the found identifiers.
				( [ key ] ) => this.unsubscribe( key )
			);
		} else {
			delete this.subscribers[ subscriber ];
		}
	}

	/**
	 * Get the current state value, unless selector function given, in which case the selected value from state will be
	 * returned.
	 *
	 * @param {callback} selector
	 * @returns {*}
	 */
	get( selector = null ) {
		return selector ?
			selector( this.current ) :
			this.current;
	}

	/**
	 * Set the state value and invoke all subscriber callbacks with the new value.
	 *
	 * @param {*} value
	 * @returns {*}
	 */
	set( value ) {
		// If function passed as value, pass the current state value as an argument so eventual value can be evaluated.
		if ( value instanceof Function ) {
			value = value( this.current );
		}

		for ( const subscriber of Object.values( this.subscribers ) ) {
			// If subscriber has selector, verify the selected value has changed before changing state.
			if ( ! subscriber.selector || this.selectorComparison( value, this.current, subscriber.selector ) ) {
				subscriber.callback( value );
			}
		}

		return this.current = value;
	}

	/**
	 * Update state value using the value returned from the `apply` method of each state. It's used when a state listens
	 * to commands execution, and the state should be updated before or after.
	 */
	update() {
		if ( this.apply ) {
			this.set( this.apply() );
		}
	}

	/**
	 * Check whether a selected value is different between two states.
	 *
	 * @param {*} left
	 * @param {*} right
	 * @param {callback} selector
	 * @returns {boolean}
	 */
	selectorComparison( left, right, selector ) {
		//TODO: Adapt it to objects, arrays and functions.
		return Object.is( selector( left ), selector( right ) );
	}
}
