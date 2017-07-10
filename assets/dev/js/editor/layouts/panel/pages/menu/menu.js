var PanelMenuItemView = require( 'elementor-panel/pages/menu/views/item' ),
	PanelMenuPageView;

PanelMenuPageView = Marionette.CollectionView.extend( {
	id: 'elementor-panel-page-menu',

	childView: PanelMenuItemView,

	initialize: function() {
		var menu =  [
			{
            	name: 'global-colors',
				icon: 'fa fa-paint-brush',
				title: elementor.translate( 'global_colors' ),
				type: 'page',
				pageName: 'colorScheme'
			},
			{
	            name: 'global-fonts',
				icon: 'fa fa-font',
				title: elementor.translate( 'global_fonts' ),
				type: 'page',
				pageName: 'typographyScheme'
			},
			{
				name: 'color-picker',
				icon: 'fa fa-eyedropper',
				title: elementor.translate( 'color_picker' ),
				type: 'page',
				pageName: 'colorPickerScheme'
			},
			{
				name: 'revision-history',
				icon: 'fa fa-history',
				title: elementor.translate( 'revision_history' ),
				type: 'page',
				pageName: 'revisionsPage'
			},
			{
	            name: 'clear-page',
				icon: 'fa fa-eraser',
				title: elementor.translate( 'clear_page' ),
				callback: function() {
					elementor.clearPage();
				}
			},
			{
				name: 'elementor-settings',
				icon: 'eicon-elementor',
				title: elementor.translate( 'elementor_settings' ),
				type: 'link',
				link: elementor.config.settings_page_link,
				newTab: true
			},
			{
				name: 'about-elementor',
				icon: 'fa fa-info-circle',
				title: elementor.translate( 'about_elementor' ),
				type: 'link',
				link: elementor.config.elementor_site,
				newTab: true
			}
		];

		menu = elementor.hooks.applyFilters( 'panel/menu/items', menu );

		this.collection = new Backbone.Collection( menu );
	},

	addItem: function( itemData, before ) {
		var options = {};

		if ( before ) {
			var beforeItem = this.collection.findWhere( { name: before } );

			if ( beforeItem ) {
				options.at = this.collection.indexOf( beforeItem );
			}
		}

		this.collection.add( itemData, options );
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
				var link = childView.model.get( 'link' ),
					isNewTab = childView.model.get( 'newTab' );

				if ( isNewTab ) {
					open( link, '_blank' );
				} else {
					location.href = childView.model.get( 'link' );
				}

				break;

			default:
				var callback = childView.model.get( 'callback' );

				if ( _.isFunction( callback ) ) {
					callback.call( childView );
				}
		}
	}
} );

module.exports = PanelMenuPageView;
