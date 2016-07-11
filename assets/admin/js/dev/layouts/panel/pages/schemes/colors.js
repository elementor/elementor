var PanelSchemeBaseView = require( 'elementor-panel/pages/schemes/base' ),
	PanelSchemeColorsView;

PanelSchemeColorsView = PanelSchemeBaseView.extend( {

	ui: function() {
		var ui = PanelSchemeBaseView.prototype.ui.apply( this, arguments );

		ui.systemSchemes = '.elementor-panel-scheme-color-system-scheme';

		return ui;
	},

	events: function() {
		var events = PanelSchemeBaseView.prototype.events.apply( this, arguments );

		events[ 'click @ui.systemSchemes' ] = 'onSystemSchemeClick';

		return events;
	},

	getChildView: function() {
		return require( 'elementor-panel/pages/schemes/items/color' );
	},

	getType: function() {
		return 'color';
	},

	onSystemSchemeClick: function( event ) {
		var $schemeClicked = Backbone.$( event.currentTarget ),
			schemeName = $schemeClicked.data( 'schemeName' ),
			scheme = elementor.config.system_schemes.color[ schemeName ].items;

		this.changeChildrenUIValues( scheme );
	}
} );

module.exports = PanelSchemeColorsView;
