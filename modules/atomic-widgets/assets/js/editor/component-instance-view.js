import AtomicContainer from './atomic-element-model';

// const BaseElementView = elementor.modules.elements.views.BaseElement;
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
		console.log('------------ _renderTemplate ------------');
		console.log(20, this);
		const elements = await this.getComponentData();
		console.log(22, this);
		const firstElement = elements.at( 0 );
		console.log(24,this);
		const firstElementView = this.getChildView( firstElement );
		console.log(26,this);
		var view = this.buildChildView( firstElement, firstElementView, { model: firstElement } );

		// this.children.add(view);
		// this.$el.html( '<div class="e-component">');
		console.log(31, this);
      	await this.renderChildView(view, 0);
		  console.log(33, this);
		const html = this.$el[0].outerHTML;
		console.log(35,this);
		console.log('------------ html ------------');
		console.log(37,this);
		// console.log(this.$el[0].to);
		console.log(39,this);
		console.log(html);
		console.log(41,this);
		// this.$el.html( '<div class="e-component">' + html + '</div>' );
		console.log(43,this);
		
		// view.render();
		// const html = view.$el[0].outerHTML;
		// this.$el.html( '<div class="e-component">' + html + '</div>' );
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
