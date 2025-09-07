import AtomicContainer from './atomic-element-model';

const BaseElementView = elementor.modules.elements.views.BaseElement;

const ComponentInstanceView = BaseElementView.extend( {
	template: Marionette.TemplateCache.get( `#tmpl-elementor-e-component-content` ),

	// async initialize() {
	// 	await this.setupComponentData();
	// 	BaseElementView.prototype.initialize.apply( this, arguments );
	// },

	// async render() {
	// 	await this.setupComponentData();
	// 	BaseElementView.prototype.render.apply( this, arguments );
	// },

	async _renderTemplate() {
		const elements = await this.getComponentData();
		const firstElement = elements.at( 0 );
		const firstElementView = this.getChildView( firstElement );
		var view = this.buildChildView( firstElement, firstElementView, { model: firstElement } );

		// this.children.add(view);
    //   this.renderChildView(view, 0);
		view.render();
		const html = view.$el[0].innerHTML;
		this.$el.html( '<div class="e-component">' + html + '</div>' );
	},

	async getComponentData() {
		const instanceSettings = this.model.get( 'settings' ).toJSON();
		const componentId = instanceSettings.component_id.value;

		// Get component data from cache or fetch it
		const componentData = elementor.documents[ componentId ] ?? ( await elementor.documents.request( componentId ) );

		if ( ! componentData || ! componentData.elements || ! componentData.elements[ 0 ] ) {
			return;
		}
		const elements = this.createBackboneElementsCollection( componentData.elements );

		return elements;
	},

	createBackboneElementsCollection( json ) {
		const ElementCollection = require( 'elementor-elements/collections/elements' );

		return new ElementCollection( json );
	},

	createBackboneElementsModel( elementsCollection ) {
		return new Backbone.Model( {
			elements: elementsCollection,
		} );
	},

} );

export default ComponentInstanceView;
