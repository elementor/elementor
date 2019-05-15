export default class extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.components = {};
	}

	printAll() {
		console.log( Object.keys( this.components ).sort() ); // eslint-disable-line no-console
	}

	register( component, args ) {
		this.components[ component.namespace ] = component;

		this.components[ component.namespace ].init( args );

		return this;
	}

	get( id ) {
		return this.components[ id ];
	}
}
