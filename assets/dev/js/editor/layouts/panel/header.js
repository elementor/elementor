var PanelHeaderItemView;

PanelHeaderItemView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-header',

	id: 'elementor-panel-header',

	ui: {
		menuButton: '#elementor-panel-header-menu-button',
		menuIcon: '#elementor-panel-header-menu-button i',
		title: '#elementor-panel-header-title',
		addButton: '#elementor-panel-header-add-button'
	},

	events: {
		'click @ui.addButton': 'onClickAdd',
		'click @ui.menuButton': 'onClickMenu'
	},

	setTitle: function( title ) {
		this.ui.title.html( title );
	},

	onClickAdd: function() {
		elementor.getPanelView().setPage( 'elements' );
	},

	onClickMenu: function() {
		var panel = elementor.getPanelView(),
			currentPanelPageName = panel.getCurrentPageName(),
			nextPage = 'menu' === currentPanelPageName ? 'elements' : 'menu';

		if ( 'menu' === nextPage ) {
			var arrowClass = 'eicon-arrow-' + ( elementor.config.is_rtl ? 'right' : 'left' );

			this.ui.menuIcon.removeClass( 'eicon-menu-bar' ).addClass( arrowClass );
		}

		panel.setPage( nextPage );
	}
} );

module.exports = PanelHeaderItemView;
