var PanelMenuGroupView = require( 'elementor-panel/pages/menu/views/group' ),
	PanelMenuPageView;

PanelMenuPageView = Marionette.CompositeView.extend( {
	id: 'elementor-panel-page-menu',

	template: '#tmpl-elementor-panel-menu',

	childView: PanelMenuGroupView,

	childViewContainer: '#elementor-panel-page-menu-content',

	initialize: function() {
		this.collection = PanelMenuPageView.getGroups();
	},

	getArrowClass: function() {
		return 'eicon-arrow-' + ( elementorCommon.config.isRTL ? 'right' : 'left' );
	},

	onRender: function() {
		elementor.getPanelView().getHeaderView().ui.menuIcon.removeClass( 'eicon-menu-bar' ).addClass( this.getArrowClass() );
	},

	onDestroy: function() {
		elementor.getPanelView().getHeaderView().ui.menuIcon.removeClass( this.getArrowClass() ).addClass( 'eicon-menu-bar' );
	},
}, {
	groups: null,

	initGroups: function() {
		this.groups = new Backbone.Collection( [] );

		this.groups.add( {
			name: 'more',
			title: elementor.translate( 'more' ),
			items: [],
		} );

		this.addItem( {
			name: 'editor-preferences',
			icon: 'eicon-wrench',
			title: elementor.translate( 'preferences' ),
			type: 'page',
			callback: () => $e.route( 'panel/editor-preferences' ),
		}, 'more' );

		this.addItem( {
			name: 'view-page',
			icon: 'eicon-preview',
			title: elementor.translate( 'view_page' ),
			type: 'link',
			link: elementor.config.document.urls.permalink,
		}, 'more' );

		this.addItem( {
			name: 'exit-to-dashboard',
			icon: 'eicon-wordpress',
			title: elementor.translate( 'exit_to_dashboard' ),
			type: 'link',
			link: elementor.config.document.urls.exit_to_dashboard,
		}, 'more' );

		if ( elementor.config.user.is_administrator ) {
			this.addAdminMenu();
		}
	},

	addAdminMenu: function() {
		this.groups.add( {
			name: 'style',
			title: elementor.translate( 'global_style' ),
			items: [],
		}, { at: 0 } );

		this.groups.add( {
			name: 'settings',
			title: elementor.translate( 'settings' ),
			items: [],
		}, { at: 1 } );

		this.addItem( {
			name: 'finder',
			icon: 'eicon-search-bold',
			title: elementorCommon.translate( 'finder', 'finder' ),
			callback: () => $e.route( 'finder' ),
		}, 'more', 'view-page' );

		this.addItem( {
			name: 'global-colors',
			icon: 'eicon-paint-brush',
			title: elementor.translate( 'global_colors' ),
			type: 'page',
			callback: () => $e.route( 'panel/global-colors' ),
		}, 'style' );

		this.addItem( {
			name: 'global-fonts',
			icon: 'eicon-font',
			title: elementor.translate( 'global_fonts' ),
			type: 'page',
			callback: () => $e.route( 'panel/global-fonts' ),
		}, 'style' );

		this.addItem( {
			name: 'global-settings',
			icon: 'eicon-cogs',
			title: elementor.translate( 'global_settings' ),
			type: 'page',
			callback: () => $e.route( 'panel/general-settings/style' ),
		}, 'settings', 'elementor-settings' );

		this.addItem( {
			name: 'elementor-settings',
			icon: 'eicon-editor-external-link',
			title: elementor.translate( 'elementor_settings' ),
			type: 'link',
			link: elementor.config.settings_page_link,
			newTab: true,
		}, 'settings' );

		this.addItem( {
			name: 'about-elementor',
			icon: 'eicon-info-circle',
			title: elementor.translate( 'about_elementor' ),
			type: 'link',
			link: elementor.config.elementor_site,
			newTab: true,
		}, 'settings' );
	},

	getGroups: function() {
		if ( ! this.groups ) {
			this.initGroups();
		}

		return this.groups;
	},

	addItem: function( itemData, groupName, before ) {
		var group = this.getGroups().findWhere( { name: groupName } );

		if ( ! group ) {
			return;
		}

		var items = group.get( 'items' ),
			beforeItem;

		if ( before ) {
			beforeItem = _.findWhere( items, { name: before } );
		}

		if ( beforeItem ) {
			items.splice( items.indexOf( beforeItem ), 0, itemData );
		} else {
			items.push( itemData );
		}
	},
} );

module.exports = PanelMenuPageView;
