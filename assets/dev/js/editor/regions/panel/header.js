var PanelHeaderItemView;

PanelHeaderItemView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-header',

	id: 'elementor-panel-header',

	ui: {
		menuButton: '#elementor-panel-header-menu-button',
		menuIcon: '#elementor-panel-header-menu-button i',
		title: '#elementor-panel-header-title',
		addButton: '#elementor-panel-header-add-button',
	},

	events: {
		'click @ui.addButton': 'onClickAdd',
		'click @ui.menuButton': 'onClickMenu',
	},

	setTitle: function( title ) {
		this.ui.title.html( title );
	},

	onClickAdd: function() {
		elementor.route.to( 'panel/elements' );
	},

	onClickMenu: function() {
		if ( elementor.route.is( 'panel/menu' ) ) {
			elementor.route.to( 'panel/elements' );
		} else {
			elementor.route.to( 'panel/menu' );
		}
	},
} );

module.exports = PanelHeaderItemView;
