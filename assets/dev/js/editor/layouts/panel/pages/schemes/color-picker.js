var PanelSchemeColorsView = require( 'elementor-panel/pages/schemes/colors' ),
	PanelSchemeColorPickerView;

PanelSchemeColorPickerView = PanelSchemeColorsView.extend( {
	getType: function() {
		return 'color-picker';
	},

	getUIType: function() {
		return 'color';
	},

	onSchemeChange: function() {},

	getViewComparator: function() {
		return this.orderView;
	},

	orderView: function( model ) {
		return [ '7', '8', '1', '5', '2', '3', '6', '4' ].indexOf( model.get( 'key' ) );
	}
} );

module.exports = PanelSchemeColorPickerView;
