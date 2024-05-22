/**
 * @typedef {import('./states/ui-state-base')} UiStateBase
 */

export default class UiStates {
	/**
	 * Initialize the State Manager.
	 *
	 * @return {void}
	 */
	constructor() {
		this.states = {};
	}

	/**
	 * Register a new state.
	 *
	 * @param {UiStateBase} instance - State instance.
	 */
	register( instance ) {
		const stateId = instance.getPrefixedId();

		if ( this.states[ stateId ] ) {
			throw `State '${ stateId }' already exists.`;
		}

		this.states[ stateId ] = instance;
	}

	/**
	 * Get all existing states with their options:
	 *
	 * {
	 *     'state-id': [
	 *         'option-1',
	 *         'option-2',
	 *         'option-3',
	 *     ],
	 * }
	 *
	 * @return {Object} all existing states
	 */
	getAll() {
		const states = {};

		Object.entries( this.states ).forEach( ( [ id, instance ] ) => {
			const options = instance.getOptions();

			states[ id ] = Object.keys( options );
		} );

		return states;
	}

	/**
	 * Get the state value, or return all of them if no `state` is set.
	 *
	 * @param {string} state - State ID.
	 *
	 * @return {UiStateBase} state value
	 */
	get( state ) {
		if ( state ) {
			return this.states[ state ];
		}

		return this.states;
	}

	/**
	 * Set the current state value and trigger its callbacks & events.
	 * This function triggers a `e-ui-state:${ stateID }` event to the scope, with `oldValue` & `newValue`
	 * under `e.detail`.
	 * Additionally, it adds a `e-ui-state--${ stateID }__${ value }` class to the scope element.
	 *
	 * @param {string} state - State ID.
	 * @param {string} value - New state value.
	 *
	 * @return {void}
	 */
	set( state, value ) {
		// Invalid state or option.
		if ( ! this.get( state ) ) {
			throw `State '${ state }' doesn't exist.`;
		}

		const oldValue = this.getCurrent( state ),
			classPrefix = `e-ui-state--${ state.replaceAll( '/', '-' ) }`,
			oldStateClass = `${ classPrefix }__${ oldValue }`,
			newStateClass = `${ classPrefix }__${ value }`,
			scopes = this.get( state ).getScopes();

		// Set the current state to the new value.
		this.get( state ).set( value );

		scopes.forEach( ( scope ) => {
			scope.classList.remove( oldStateClass );

			// Set the new class only if there is a value (i.e. it's not a state removal action).
			if ( value ) {
				scope.classList.add( newStateClass );
			}

			// Dispatch a custom state-change event to the scope.
			const event = new CustomEvent( `e-ui-state:${ state }`, {
				detail: {
					oldValue,
					newValue: value,
				},
			} );

			scope.dispatchEvent( event );
		} );
	}

	/**
	 * Remove a state.
	 *
	 * @param {string} state - State ID.
	 *
	 * @return {void}
	 */
	remove( state ) {
		this.set( state, '' );
	}

	/**
	 * Get the current state value.
	 *
	 * @param {string} state - State ID.
	 *
	 * @return {string} current state value
	 */
	getCurrent( state ) {
		return this.get( state )?.getCurrent();
	}
}
