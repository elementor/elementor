import AtomicContainer from './atomic-element-model';

const BaseElementView = elementor.modules.elements.views.BaseElement;

const ComponentInstanceView = BaseElementView.extend( {
	template: Marionette.TemplateCache.get( `#tmpl-elementor-e-component-content` ),

	async initialize() {
		await this.setupComponentData();
		BaseElementView.prototype.initialize.apply( this, arguments );
	},

	async render() {
		await this.setupComponentData();
		BaseElementView.prototype.render.apply( this, arguments );
	},

	async setupComponentData() {
		const instanceSettings = this.model.get( 'settings' ).toJSON();
		const componentId = instanceSettings.component_id.value;

		// Get component data from cache or fetch it
		const componentData = elementor.documents[ componentId ] ?? ( await elementor.documents.request( componentId ) );

		if ( ! componentData || ! componentData.elements || ! componentData.elements[ 0 ] ) {
			return;
		}
		const elements = this.createBackboneElementsCollection( componentData.elements );

		this.model.set( 'elements', elements );
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
