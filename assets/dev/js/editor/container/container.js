import Panel from './panel';

export default class Container {
	/**
	 * Container id.
	 *
	 * @type {String}
	 */
	id;

	/**
	 * Container document
	 *
	 * @type {Container}
	 */
	document;

	/**
	 * Container model.
	 *
	 * @type {Backbone.Model}
	 */
	model;

	/**
	 * Container settings.
	 *
	 * @type {Backbone.Model}
	 */
	settings;

	/**
	 * Container view.
	 *
	 * @type {{}}
	 */
	view;

	/**
	 * Container parent.
	 *
	 * @type {Container}
	 */
	parent;

	/**
	 * Container children(s).
	 *
	 * @type {Array}
	 */
	children = [];

	/**
	 * Container dynamic.
	 *
	 * @type {Backbone.Model}
	 */
	dynamic;

	/**
	 * Container label.
	 *
	 * @type {String}
	 */
	label;

	/**
	 * Container controls.
	 *
	 * @type {{}}
	 */
	controls;

	/**
	 * Container renderer (The one who render).
	 *
	 * @type {Container}
	 */
	renderer;

	/**
	 * Container panel.
	 *
	 * @type {Panel}
	 */
	panel;

	/**
	 * Function constructor().
	 *
	 * Create container.
	 *
	 * @param {{}} args
	 */
	constructor( args ) {
		args = Object.entries( args );

		// If empty.
		if ( 0 === args.length ) {
			return;
		}

		// Set properties, if not defined - keep the defaults.
		args.forEach( ( [ key, value ] ) => {
			this[ key ] = 'undefined' === typeof value ? this[ key ] : value;
		} );

		if ( 'undefined' === typeof this.renderer ) {
			this.renderer = this;
		}

		this.dynamic = new Backbone.Model( this.model.get( '__dynamic__' ) );
		this.panel = new Panel( this );
	}

	/**
	 * Function lookup().
	 *
	 * If the view were destroyed, we gonna try to find it again if it exist.
	 *
	 * @returns {Container}
	 */
	lookup() {
		let result = this;

		if ( ! this.view.lookup ) {
			return result;
		}

		const lookup = this.view.lookup();

		if ( lookup ) {
			result = lookup.getContainer();
		}

		return result;
	}

	/**
	 * Function render().
	 *
	 * Tell the `this.renderer` view.renderOnChange.
	 */
	render() {
		if ( ! this.renderer ) {
			return;
		}

		this.renderer.view.renderOnChange( this.settings );
	}
}
