export default class extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.components = {};
		this.activeComponents = {};
	}

	printAll() {
		console.log( Object.keys( this.components ).sort() ); // eslint-disable-line no-console
	}

	register( component ) {
		this.components[ component.getNamespace() ] = component;

		return component;
	}

	get( id ) {
		return this.components[ id ];
	}

	activate( namespace ) {
		// Add as last.
		this.inactivate( namespace );
		this.activeComponents[ namespace ] = true;
	}

	inactivate( namespace ) {
		delete this.activeComponents[ namespace ];
	}
}
