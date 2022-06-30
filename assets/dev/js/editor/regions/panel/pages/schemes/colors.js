var PanelSchemeBaseView = require( 'elementor-panel/pages/schemes/base' ),
	PanelSchemeColorsView;

PanelSchemeColorsView = PanelSchemeBaseView.extend( {
	ui() {
		var ui = PanelSchemeBaseView.prototype.ui.apply( this, arguments );

		ui.systemSchemes = '.elementor-panel-scheme-color-system-scheme';

		return ui;
	},

	events() {
		var events = PanelSchemeBaseView.prototype.events.apply( this, arguments );

		events[ 'click @ui.systemSchemes' ] = 'onSystemSchemeClick';

		return events;
	},

	getType() {
		return 'color';
	},

	onSystemSchemeClick( event ) {
		const $schemeClicked = jQuery( event.currentTarget ),
			schemeName = $schemeClicked.data( 'schemeName' ),
			scheme = elementor.config.system_schemes[ this.getType() ][ schemeName ].items;

		this.changeChildrenUIValues( scheme );
	},
} );

module.exports = PanelSchemeColorsView;
