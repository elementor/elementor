var PanelMenuItemView = require( 'elementor-panel/pages/menu/views/item' ),
	PanelMenuPageView;

PanelMenuPageView = Marionette.CollectionView.extend( {
	id: 'elementor-panel-page-menu',

	childView: PanelMenuItemView,

	initialize: function() {
		this.collection = new Backbone.Collection( [
            {
                icon: 'paint-brush',
                title: elementor.translate( 'global_colors' ),
				type: 'page',
                pageName: 'colorScheme'
            },
            {
                icon: 'font',
                title: elementor.translate( 'global_fonts' ),
				type: 'page',
                pageName: 'typographyScheme'
            },
			{
				icon: 'eyedropper',
				title: elementor.translate( 'color_picker' ),
				type: 'page',
				pageName: 'colorPickerScheme'
			},
			{
				icon: 'cog',
				title: elementor.translate( 'elementor_settings' ),
				type: 'link',
				link: elementor.config.settings_page_link,
				newTab: true
			},
			{
				icon: 'history',
				title: elementor.translate( 'revisions_history' ) + '  <span>(' + elementor.translate( 'soon' ) + ')</span>'
			},
            {
                icon: 'eraser',
                title: elementor.translate( 'clear_page' ),
                callback: function() {
                    elementor.clearPage();
                }
            },
			{
				icon: 'info-circle',
				title: elementor.translate( 'about_elementor' ),
				type: 'link',
				link: elementor.config.elementor_site,
				newTab: true
			}
		] );
	},

	onChildviewClick: function( childView ) {
		var menuItemType = childView.model.get( 'type' );

		switch ( menuItemType ) {
			case 'page' :
				var pageName = childView.model.get( 'pageName' ),
					pageTitle = childView.model.get( 'title' );

				elementor.getPanelView().setPage( pageName, pageTitle );
				break;

			case 'link' :
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
