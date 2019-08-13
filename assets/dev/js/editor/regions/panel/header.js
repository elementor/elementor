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
		$e.route( 'panel/elements/categories' );
	},

	onClickMenu: function() {
		if ( $e.routes.is( 'panel/menu' ) ) {
			$e.route( 'panel/elements/categories' );
		} else {
			$e.route( 'panel/menu' );
		}
	},
} );

module.exports = PanelHeaderItemView;
