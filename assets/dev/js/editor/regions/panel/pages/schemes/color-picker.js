var PanelSchemeColorsView = require( 'elementor-panel/pages/schemes/colors' ),
	PanelSchemeColorPickerView;

import ColorPicker from '../../../../utils/color-picker';

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
		return ColorPicker.getColorPickerPaletteIndex( model.get( 'key' ) );
	},
} );

module.exports = PanelSchemeColorPickerView;
