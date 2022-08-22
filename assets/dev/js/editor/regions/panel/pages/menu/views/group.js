const PanelMenuItemView = require( 'elementor-panel/pages/menu/views/item' );

module.exports = Marionette.CompositeView.extend( {
	template: '#tmpl-elementor-panel-menu-group',

	className: 'elementor-panel-menu-group',

	childView: PanelMenuItemView,

	childViewContainer: '.elementor-panel-menu-items',

	initialize() {
		this.collection = new Backbone.Collection( this.model.get( 'items' ) );
	},

	onChildviewClick( childView ) {
		const callback = childView.model.get( 'callback' );

		if ( _.isFunction( callback ) ) {
			callback.call( childView );
		}
	},
} );
