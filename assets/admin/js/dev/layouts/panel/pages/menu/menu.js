var PanelMenuItemView = require( 'elementor-panel/pages/menu/views/item' ),
	PanelMenuPageView;

PanelMenuPageView = Marionette.CollectionView.extend( {
	id: 'elementor-panel-page-menu',

	childView: PanelMenuItemView,

	initialize: function() {
		this.collection = new Backbone.Collection( [
            {
                icon: 'paint-brush',
                title: elementor.translate( 'colors' ),
				type: 'page',
                pageName: 'colorScheme'
            },
            {
                icon: 'font',
                title: elementor.translate( 'fonts' ),
				type: 'page',
                pageName: 'typographyScheme'
            },
            {
				icon: 'file-text',
				title: elementor.translate( 'page_settings' ) + '  <span>(' + elementor.translate( 'soon' ) + ')</span>'
			},
			{
				icon: 'cog',
				title: elementor.translate( 'elementor_settings' ),
				type: 'link',
				link: elementor.config.settings_page_link
			},
			{
				icon: 'history',
				title: elementor.translate( 'revisions_history' ) + '  <span>(' + elementor.translate( 'soon' ) + ')</span>'
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
		}
	}
} );

module.exports = PanelMenuPageView;
