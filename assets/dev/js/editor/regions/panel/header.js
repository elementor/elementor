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
		this.getParent().close();
	},

	onRender: function( ...args ) {
		if ( this.getParent().canFloat() ) {
			this.$el.addClass( 'e-panel-floatable' );
		} else {
			this.ui.floatButton.remove();
		}
	},

	getParent: function() {
		return this._parent._parent._parent._parent;
	},

	onClickFloat: function() {
		const parentPanel = this.getParent();
		const { isDocked } = parentPanel;

		if ( isDocked ) {
			parentPanel.undock();
		} else {
			parentPanel.dock( parentPanel.getDockingSide() );
		}
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
