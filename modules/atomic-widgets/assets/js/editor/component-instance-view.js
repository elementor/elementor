import AtomicContainer from './atomic-element-model';
import createAtomicElementView from './atomic-element-view';

const BaseElementView = elementor.modules.elements.views.BaseElement;
const AtomicElementView = createAtomicElementView('e-component');

const ComponentInstanceView = AtomicElementView.extend( {
	// template: Marionette.TemplateCache.get( `#tmpl-elementor-e-component-content` ),

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

		// Add the view to children collection
		this.children.add(view);
		
		// First set the container
		this.$el.html('<div class="e-component"></div>');
		
		// Then render the child view properly using Elementor's mechanism
		await this.renderChildView(view, 0);
		
		// Move the rendered view inside the e-component container
		this.$('.e-component').append(view.$el);
	},

	async renderChildView(view, index) {
		// console.log('------------ renderChildView ------------');
		// console.log(view);
		// console.log(index);
		await BaseElementView.prototype.renderChildView.apply( this, arguments );
	},

	async getComponentData() {
		const instanceSettings = this.model.get( 'settings' ).toJSON();
		const componentId = instanceSettings.component_id.value;

		// Get component data from cache or fetch it
		const componentData = elementor.documents[ componentId ] ?? ( await elementor.documents.request( componentId ) );

		if ( ! componentData || ! componentData.elements || ! componentData.elements[ 0 ] ) {
			return;
		}

		const lockedElements = componentData.elements.map( (element) => ({ ...element, isLocked: true }) );
		const elements = this.createBackboneElementsCollection( lockedElements );

		return elements;
	},
	behaviors() {
		return [];
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
