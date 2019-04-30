export default class extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.components = {};
	}

	printAll() {
		console.log( Object.keys( this.components ).sort() ); // eslint-disable-line no-console
	}

	register( id, component, args ) {
		this.components[ id ] = component;

		this.components[ id ].init( args );

		return this;
	}

	get( id ) {
		return this.components[ id ];
	}
}
