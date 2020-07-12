var PanelMenuGroupView = require( 'elementor-panel/pages/menu/views/group' ),
	PanelMenuPageView;

PanelMenuPageView = Marionette.CompositeView.extend( {
	id: 'elementor-panel-page-menu',

	template: '#tmpl-elementor-panel-menu',

	childView: PanelMenuGroupView,

	childViewContainer: '#elementor-panel-page-menu-content',

	// Remove empty groups that exist for BC.
	filter: ( child ) => {
		return child.get( 'items' ).length;
	},

	initialize: function() {
		this.collection = PanelMenuPageView.getGroups();

		this.registerDocumentItems();

		// On switch a document, re create document items.
		elementor.once( 'document:loaded', this.registerDocumentItems );
	},

	getArrowClass: function() {
		return 'eicon-chevron-' + ( elementorCommon.config.isRTL ? 'right' : 'left' );
	},

	onRender: function() {
		elementor.getPanelView().getHeaderView().ui.menuIcon.removeClass( 'eicon-menu-bar' ).addClass( this.getArrowClass() );
	},

	onDestroy: function() {
		elementor.getPanelView().getHeaderView().ui.menuIcon.removeClass( this.getArrowClass() ).addClass( 'eicon-menu-bar' );
	},

	registerDocumentItems() {
		// Todo: internal command.
		elementor.modules.layouts.panel.pages.menu.Menu.addItem( {
			name: 'view-page',
			icon: 'eicon-preview-thin',
			title: elementor.translate( 'view_page' ),
			type: 'link',
			link: elementor.config.document.urls.permalink,
		}, 'navigate_from_page' );

		// Todo: internal command.
		elementor.modules.layouts.panel.pages.menu.Menu.addItem( {
			name: 'exit-to-dashboard',
			icon: 'eicon-wordpress',
			title: elementor.translate( 'exit_to_dashboard' ),
			type: 'link',
			link: elementor.config.document.urls.exit_to_dashboard,
		}, 'navigate_from_page' );
	},
}, {
	groups: null,

	initGroups: function() {
		this.groups = new Backbone.Collection( [] );

		// Keep the old `more` for BC, since 3.0.0.
		this.groups.add( {
			name: 'more',
			title: elementor.translate( 'more' ),
			items: [],
		} );

		this.groups.add( {
			name: 'navigate_from_page',
			title: elementor.translate( 'navigate_from_page' ),
			items: [],
		} );

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

		this.addItem( {
			name: 'editor-preferences',
			icon: 'eicon-user-preferences',
			title: elementor.translate( 'user_preferences' ),
			type: 'page',
			callback: () => $e.route( 'panel/editor-preferences' ),
		}, 'style' );

		this.groups.add( {
			name: 'settings',
			title: elementor.translate( 'settings' ),
			items: [],
		}, { at: 1 } );

		this.addItem( {
			name: 'finder',
			icon: 'eicon-search',
			title: elementorCommon.translate( 'find_anything', 'finder' ),
			callback: () => $e.route( 'finder' ),
		}, 'navigate_from_page', 'view-page' );
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

		// Remove if exist.
		const exists = _.findWhere( items, { name: itemData.name } );

		if ( exists ) {
			items.splice( items.indexOf( exists ), 1 );
		}

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
