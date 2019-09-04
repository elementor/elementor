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
		Object.entries( args ).forEach( ( [ key, value ] ) => {
			this[ key ] = value;
		} );

		if ( ! this.renderer ) {
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
		this.renderer.view.renderOnChange( this.settings );
	}
}
