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
			icon: 'fa fa-eye',
			title: elementor.translate( 'view_page' ),
			type: 'link',
			link: elementor.config.document.urls.permalink,
		}, 'go_to' );

		this.addItem( {
			name: 'exit-to-dashboard',
			icon: 'fa fa-wordpress',
			title: elementor.translate( 'exit_to_dashboard' ),
			type: 'link',
			link: elementor.config.document.urls.exit_to_dashboard,
		}, 'go_to' );

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
			icon: 'fa fa-search',
			title: elementorCommon.translate( 'finder', 'finder' ),
			callback: () => elementorCommon.finder.getLayout().showModal(),
		}, 'go_to', 'view-page' );

		this.addItem( {
			name: 'global-colors',
			icon: 'fa fa-paint-brush',
			title: elementor.translate( 'global_colors' ),
			type: 'page',
			pageName: 'colorScheme',
			route: 'panel/global-colors',
		}, 'style' );

		this.addItem( {
			name: 'global-fonts',
			icon: 'fa fa-font',
			title: elementor.translate( 'global_fonts' ),
			type: 'page',
			pageName: 'typographyScheme',
			route: 'panel/global-fonts',
		}, 'style' );

		this.addItem( {
			name: 'color-picker',
			icon: 'fa fa-eyedropper',
			title: elementor.translate( 'color_picker' ),
			type: 'page',
			pageName: 'colorPickerScheme',
			route: 'panel/color-picker',
		}, 'style' );

		this.addItem( {
			name: 'elementor-settings',
			icon: 'fa fa-external-link',
			title: elementor.translate( 'elementor_settings' ),
			type: 'link',
			link: elementor.config.settings_page_link,
			newTab: true,
		}, 'settings' );

		this.addItem( {
			name: 'about-elementor',
			icon: 'fa fa-info-circle',
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

		if ( itemData.route ) {
			elementor.route.register( itemData.route, () => {
				elementor.getPanelView().setPage( itemData.pageName );
			} );
		}
	},
} );

module.exports = PanelMenuPageView;
