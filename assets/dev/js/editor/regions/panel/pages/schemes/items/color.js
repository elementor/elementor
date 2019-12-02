var PanelSchemeItemView = require( 'elementor-panel/pages/schemes/items/base' );
import ColorPicker from '../../../../../utils/color-picker';

module.exports = PanelSchemeItemView.extend( {
	getUIType: function() {
		return 'color';
	},

	ui: {
		pickerPlaceholder: '.elementor-panel-scheme-color-picker-placeholder',
	},

	changeUIValue: function( newValue ) {
		this.colorPicker.picker.setColor( newValue );
	},

	onRender: function() {
		this.colorPicker = new ColorPicker( {
			picker: {
				el: this.ui.pickerPlaceholder[ 0 ],
				default: this.model.get( 'value' ),
			},
			onChange: () => {
				this.triggerMethod( 'value:change', this.colorPicker.getValue() );
			},
			onClear: () => {
				this.triggerMethod( 'value:change', '' );
			},
		} );
	},

	onBeforeDestroy: function() {
		this.colorPicker.destroy();
	},
} );
