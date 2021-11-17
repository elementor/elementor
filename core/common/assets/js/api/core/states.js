export default class States {
	/**
	 * List of component states.
	 *
	 * @type {{}}
	 */
	states = {};

	/**
	 * Get a state by its name from the given component.
	 *
	 * @param {ComponentBase} component
	 * @param {StateBase} state
	 *
	 * @returns {[]}
	 */
	get( component, state ) {
		const namespace = $e.components.resolve( component )
			.getNamespace();

		return this.states[ namespace ]?.[ state ] ||
			this.error( `${ state } state doesn't exists.` );
	}

	/**
	 * Get states of all components, unless component is specified, in which case only its states are returned.
	 *
	 * @param {ComponentBase} component
	 *
	 * @returns {string[]}
	 */
	getAll( component = null ) {
		let states;

		if ( component ) {
			states = Object.keys(
				this.states[ $e.components.resolve( component ).getNamespace() ]
			).sort();
		} else {
			states = Object.fromEntries( Object.entries( this.states ).map(
				( [ key, value ] ) => [ key, Object.keys( value ) ]
			).sort() );
		}

		return states;
	}

	/**
	 * Register a state instance to the component.
	 *
	 * @param {ComponentBase|string} component
	 * @param {string} state
	 * @param {StateBase} instance
	 *
	 * @returns {this}
	 */
	register( component, state, instance ) {
		component = $e.components.resolve( component );

		if ( ! this.states[ component.getNamespace() ] ) {
			this.states[ component.getNamespace() ] = {};
		}

		this.states[ component.getNamespace() ][ state ] = instance;

		return this;
	}

	/**
	 * Throws a states-related error.
	 *
	 * @throws {Error}
	 *
	 * @param {string} message
	 */
	error( message ) {
		throw Error( `States: ${ message }` );
	}
}
