var PanelSchemeItemView = require( 'elementor-panel/pages/schemes/items/base' );
import ColorPicker from 'elementor-editor/utils/color-picker';

module.exports = PanelSchemeItemView.extend( {
	getUIType() {
		return 'color';
	},

	ui: {
		pickerPlaceholder: '.elementor-panel-scheme-color-picker-placeholder',
	},

	changeUIValue( newValue ) {
		this.colorPicker.picker.setColor( newValue );
	},

	onRender() {
		this.colorPicker = new ColorPicker( {
			picker: {
				el: this.ui.pickerPlaceholder[ 0 ],
				default: this.model.get( 'value' ),
			},
			onChange: () => {
				this.triggerMethod( 'value:change', this.colorPicker.getColor() );
			},
			onClear: () => {
				this.triggerMethod( 'value:change', '' );
			},
		} );
	},

	onBeforeDestroy() {
		this.colorPicker.destroy();
	},
} );
