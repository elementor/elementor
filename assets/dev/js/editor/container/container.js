import Panel from './panel';

export default class Container {
	// TODO: add documentation.
	id;
	model;
	view;
	settings;
	parent;
	children;
	dynamic;
	renderer;
	panel;

	constructor( args ) {
		args = Object.entries( args );

		// If empty.
		if ( 0 === args.length ) {
			return;
		}

		args.forEach( ( [ key, value ] ) => {
			this[ key ] = value;
		} );

		if ( 'undefined' === typeof this.renderer ) {
			this.renderer = this;
		}

		this.dynamic = new Backbone.Model( this.model.get( '__dynamic__' ) );
		this.panel = new Panel( this );
	}

	lookup() {
		let result = this;

		const lookup = this.view.lookup();

		if ( lookup ) {
			result = lookup.getContainer();
		}

		return result;
	}

	render() {
		if ( ! this.renderer ) {
			return;
		}

		this.renderer.view.renderOnChange( this.settings );
	}
}
