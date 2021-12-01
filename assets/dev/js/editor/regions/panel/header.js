var PanelHeaderItemView;

PanelHeaderItemView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-header',

	id: 'elementor-panel__header',

	ui: {
		// menuButton: '#elementor-panel-header-menu-button',
		// menuIcon: '#elementor-panel-header-menu-button i',
		title: '#elementor-panel-header-title',
		addButton: '#elementor-panel-header-add-button',
		closeButton: '#elementor-panel__header-close',
		floatButton: '#elementor-panel__header-float',
	},

	events: {
		'click @ui.addButton': 'onClickAdd',
		'click @ui.closeButton': 'onClickClose',
		'click @ui.floatButton': 'onClickFloat',
		// 'click @ui.menuButton': 'onClickMenu',
	},

	behaviors: function() {
		return elementor.hooks.applyFilters( 'panel/header/behaviors', {}, this );
	},

	setTitle: function( title ) {
		this.ui.title.html( title );
	},

	onClickAdd: function() {
		$e.route( 'panel/elements/categories' );
	},

	onClickClose: function() {
		$e.run( 'panel/close' );
	},

	onClickFloat: function() {
		elementorCommon.elements.$body.addClass( 'elementor-panel--float' );
		elementorCommon.elements.$body.removeClass( 'elementor-panel-docked elementor-panel-docked--left elementor-panel-docked--right' );
	},

	// onClickMenu: function() {
	// 	if ( $e.routes.is( 'panel/menu' ) ) {
	// 		$e.route( 'panel/elements/categories' );
	// 	} else {
	// 		$e.route( 'panel/menu' );
	// 	}
	// },
} );

module.exports = PanelHeaderItemView;
