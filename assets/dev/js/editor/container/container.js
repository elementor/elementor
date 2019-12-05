import ArgsObject from '../../modules/imports/args-object';
import Panel from './panel';

export default class Container extends ArgsObject {
	/**
	 * Container type.
	 *
	 * @type {string}
	 */
	type;

	/**
	 * Container id.
	 *
	 * @type {string}
	 */
	id;

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
	 * @type {Marionette.CompositeView||BaseElementView}
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
	 * @type {string}
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
	 *
	 * @throws {Error}
	 */
	constructor( args ) {
		super( args );

		// Validate args.
		this.validateArgs( args );

		args = Object.entries( args );

		// If empty.
		if ( 0 === args.length ) {
			throw Error( 'Container cannot be empty.' );
		}

		// Set properties, if not defined - keep the defaults.
		args.forEach( ( [ key, value ] ) => {
			this[ key ] = 'undefined' === typeof value ? this[ key ] : value;
		} );

		if ( 'undefined' === typeof this.renderer ) {
			this.renderer = this;
		}

		this.dynamic = new Backbone.Model( this.settings.get( '__dynamic__' ) );
		this.panel = new Panel( this );
	}

	validateArgs( args ) {
		this.requireArgumentType( 'type', 'string', args );
		this.requireArgumentType( 'id', 'string', args );

		this.requireArgumentInstance( 'settings', Backbone.Model, args );
		this.requireArgumentInstance( 'model', Backbone.Model, args );
	}

	/**
	 * Function lookup().
	 *
	 * If the view were destroyed, try to find it again if it exists.
	 *
	 * TODO: Refactor.
	 *
	 * @returns {Container}
	 */
	lookup() {
		let result = this;

		if ( ! this.renderer ) {
			return this;
		}

		if ( this !== this.renderer && this.renderer.view.isDestroyed ) {
			this.renderer = this.renderer.lookup();
		}

		if ( undefined === this.view || ! this.view.lookup || ! this.view.isDestroyed ) {
			// Hack For repeater item the result is the parent container.
			if ( 'repeater' === this.type ) {
				this.settings = this.parent.settings.get( this.model.get( 'name' ) ).findWhere( { _id: this.id } );
			}
			return result;
		}

		const lookup = this.view.lookup();

		if ( lookup ) {
			result = lookup.getContainer();

			// Hack For repeater item the result is the parent container.
			if ( 'repeater' === this.type ) {
				this.settings = result.settings.get( this.model.get( 'name' ) ).findWhere( { _id: this.id } );
				return this;
			}
		}

		return result;
	}

	/**
	 * Function render().
	 *
	 * Call view render.
	 *
	 * Run's `this.renderer.view.renderOnChange( this.settings ) `.
	 * When `this.renderer` exist.
	 *
	 */
	render() {
		if ( ! this.renderer ) {
			return;
		}

		this.renderer.view.renderOnChange( this.settings );
	}
}
