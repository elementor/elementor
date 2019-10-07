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
			name: 'go_to',
			title: elementor.translate( 'go_to' ),
			items: [],
		} );

		this.addItem( {
			name: 'view-page',
			icon: 'eicon-preview',
			title: elementor.translate( 'view_page' ),
			type: 'link',
			link: elementor.config.document.urls.permalink,
		}, 'go_to' );

		this.addItem( {
			name: 'exit-to-dashboard',
			icon: 'eicon-wordpress',
			title: elementor.translate( 'exit_to_dashboard' ),
			type: 'link',
			link: elementor.config.document.urls.exit_to_dashboard,
		}, 'go_to' );

		if ( elementor.config.user.is_administrator ) {
			this.addAdminMenu();
		}
	},

	addAdminMenu: function() {
		this.addItem( {
			name: 'finder',
			icon: 'eicon-search',
			title: elementorCommon.translate( 'finder', 'finder' ),
			callback: () => $e.route( 'finder' ),
		}, 'go_to', 'view-page' );
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
