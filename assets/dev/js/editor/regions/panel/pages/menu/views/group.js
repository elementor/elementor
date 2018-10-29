var PanelMenuItemView = require( 'elementor-panel/pages/menu/views/item' );

module.exports = Marionette.CompositeView.extend( {
	template: '#tmpl-elementor-panel-menu-group',

	className: 'elementor-panel-menu-group',

	childView: PanelMenuItemView,

	childViewContainer: '.elementor-panel-menu-items',

	initialize: function() {
		this.collection = new Backbone.Collection( this.model.get( 'items' ) );
	},

	onChildviewClick: function( childView ) {
		var menuItemType = childView.model.get( 'type' );

		switch ( menuItemType ) {
			case 'page':
				var pageName = childView.model.get( 'pageName' ),
					pageTitle = childView.model.get( 'title' );

				elementor.getPanelView().setPage( pageName, pageTitle );

				break;

			case 'link':
				open( childView.model.get( 'link' ), '_blank' );

				break;
			default:
				var callback = childView.model.get( 'callback' );

				if ( _.isFunction( callback ) ) {
					callback.call( childView );
				}
		}
	},
} );
