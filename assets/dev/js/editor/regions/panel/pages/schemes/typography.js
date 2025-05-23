var PanelSchemeBaseView = require( 'elementor-panel/pages/schemes/base' ),
	PanelSchemeTypographyView;

PanelSchemeTypographyView = PanelSchemeBaseView.extend( {
	getType() {
		return 'typography';
	},
} );

module.exports = PanelSchemeTypographyView;
