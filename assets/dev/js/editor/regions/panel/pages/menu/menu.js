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
		let menus = [];

		const goToSection = {
			name: 'go_to',
			title: elementor.translate( 'go_to' ),
			items: [
				{
					name: 'view-page',
					icon: 'eicon-preview',
					title: elementor.translate( 'view_page' ),
					type: 'link',
					link: elementor.config.document.urls.permalink,
				},
				{
					name: 'exit-to-dashboard',
					icon: 'eicon-wordpress',
					title: elementor.translate( 'exit_to_dashboard' ),
					type: 'link',
					link: elementor.config.document.urls.exit_to_dashboard,
				},
			],
		};

		if ( elementor.config.user.is_administrator ) {
			goToSection.items.unshift( {
				name: 'finder',
				icon: 'eicon-search',
				title: elementorCommon.translate( 'finder', 'finder' ),
				callback: () => elementorCommon.finder.getLayout().showModal(),
			} );

			menus = [
				{
					name: 'style',
					title: elementor.translate( 'global_style' ),
					items: [
						{
							name: 'global-colors',
							icon: 'eicon-paint-brush',
							title: elementor.translate( 'global_colors' ),
							type: 'page',
							pageName: 'colorScheme',
						},
						{
							name: 'global-fonts',
							icon: 'eicon-font',
							title: elementor.translate( 'global_fonts' ),
							type: 'page',
							pageName: 'typographyScheme',
						},
						{
							name: 'color-picker',
							icon: 'eicon-eyedropper',
							title: elementor.translate( 'color_picker' ),
							type: 'page',
							pageName: 'colorPickerScheme',
						},
					],
				},
				{
					name: 'settings',
					title: elementor.translate( 'settings' ),
					items: [
						{
							name: 'elementor-settings',
							icon: 'eicon-editor-external-link',
							title: elementor.translate( 'elementor_settings' ),
							type: 'link',
							link: elementor.config.settings_page_link,
							newTab: true,
						},
						{
							name: 'about-elementor',
							icon: 'eicon-info-circle',
							title: elementor.translate( 'about_elementor' ),
							type: 'link',
							link: elementor.config.elementor_site,
							newTab: true,
						},
					],
				},
			];
		}

		menus.push( goToSection );

		this.groups = new Backbone.Collection( menus );
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
