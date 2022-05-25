import { Sources } from 'elementor-editor/editor-constants';

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

	behaviors: function() {
		return elementor.hooks.applyFilters( 'panel/header/behaviors', {}, this );
	},

	setTitle: function( title ) {
		this.ui.title.html( title );
	},

	onClickAdd: function() {
		$e.route( 'panel/elements/categories', {}, { source: Sources.PANEL } );
	},

	onClickMenu: function() {
		if ( $e.routes.is( 'panel/menu' ) ) {
			$e.route( 'panel/elements/categories', {}, { source: Sources.PANEL } );
		} else {
			$e.route( 'panel/menu', {}, { source: Sources.PANEL } );
		}
	},
} );

module.exports = PanelHeaderItemView;
