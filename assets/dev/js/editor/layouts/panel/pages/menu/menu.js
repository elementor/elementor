var PanelMenuItemView = require( 'elementor-panel/pages/menu/views/item' ),
	PanelMenuPageView;

PanelMenuPageView = Marionette.CollectionView.extend( {
	id: 'elementor-panel-page-menu',

	childView: PanelMenuItemView,

	initialize: function() {
		this.collection = PanelMenuPageView.getItems();
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
}, {
	items: null,

	initItems: function() {
		this.items = new Backbone.Collection( [
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
		] );
	},

	getItems: function() {
		if ( ! this.items ) {
			this.initItems();
		}

		return this.items;
	},

	addItem: function( itemData, before ) {
		var items = this.getItems(),
			options = {};

		if ( before ) {
			var beforeItem = items.findWhere( { name: before } );

			if ( beforeItem ) {
				options.at = items.indexOf( beforeItem );
			}
		}

		items.add( itemData, options );
				}
} );

module.exports = PanelMenuPageView;
