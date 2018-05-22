var PanelElementsElementsCollection = require( '../collections/elements' ),
	PanelElementsCategoryView;

PanelElementsCategoryView = Marionette.CompositeView.extend( {
	template: '#tmpl-elementor-panel-elements-category',

	className: 'elementor-panel-category',

	ui: {
		title: '.elementor-panel-category-title'
	},

	events: {
		'click @ui.title': 'onTitleClick'
	},

	id: function() {
		return 'elementor-panel-category-' + this.model.get( 'name' );
	},

	childView: require( 'elementor-panel/pages/elements/views/element' ),

	childViewContainer: '.elementor-panel-category-items',

	initialize: function() {
		this.collection = new PanelElementsElementsCollection( this.model.get( 'items' ) );
	},

	onTitleClick: function( event ) {
		jQuery( event.currentTarget ).toggleClass( 'elementor-active' );
	}
} );

module.exports = PanelElementsCategoryView;
