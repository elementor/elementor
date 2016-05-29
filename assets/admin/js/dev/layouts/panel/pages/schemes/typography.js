var PanelSchemeBaseView = require( 'elementor-panel/pages/schemes/base' ),
	PanelSchemeTypographyView;

PanelSchemeTypographyView = PanelSchemeBaseView.extend( {
	template: '#tmpl-elementor-panel-schemes-typography',

	getChildView: function() {
		return require( 'elementor-panel/pages/schemes/items/typography' );
	},

	getType: function() {
		return 'typography';
	}
} );

module.exports = PanelSchemeTypographyView;
