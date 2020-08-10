export default class extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.components = {};
		this.activeComponents = {};

		this.state = 'none';
	}

	getAll() {
		return Object.keys( this.components ).sort();
	}

	register( component ) {
		if ( this.components[ component.getNamespace() ] ) {
			return;
		}

		this.state = 'register';

		if ( component.isRegistered ) {
			throw Error( `component: '${ component.getNamespace() }' is already registered.` );
		}

		component.registerAPI();

		this.state = 'register:after:' + component.getNamespace();

		this.components[ component.getNamespace() ] = component;

		return component;
	}

	/**
	 * @returns {Component}
	 */
	get( id ) {
		return this.components[ id ];
	}

	getActive() {
		return this.activeComponents;
	}

	activate( namespace ) {
		// Add as last.
		this.inactivate( namespace );
		this.activeComponents[ namespace ] = true;
	}

	inactivate( namespace ) {
		delete this.activeComponents[ namespace ];
	}

	isActive( namespace ) {
		return !! this.activeComponents[ namespace ];
	}
}
