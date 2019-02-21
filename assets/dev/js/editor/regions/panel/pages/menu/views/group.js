const PanelMenuItemView = require( 'elementor-panel/pages/menu/views/item' );

module.exports = Marionette.CompositeView.extend( {
	template: '#tmpl-elementor-panel-menu-group',

	className: 'elementor-panel-menu-group',

	childView: PanelMenuItemView,

	childViewContainer: '.elementor-panel-menu-items',

	initialize: function() {
		this.collection = new Backbone.Collection( this.model.get( 'items' ) );
	},

	onChildviewClick: function( childView ) {
		const menuItemType = childView.model.get( 'type' );

		switch ( menuItemType ) {
			case 'page':
				elementorCommon.route.to( childView.model.get( 'route' ) );

				break;

			default:
				const callback = childView.model.get( 'callback' );

				if ( _.isFunction( callback ) ) {
					callback.call( childView );
				}
		}
	},
} );
