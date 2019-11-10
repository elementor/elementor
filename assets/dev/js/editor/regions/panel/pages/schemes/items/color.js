var PanelSchemeItemView = require( 'elementor-panel/pages/schemes/items/base' ),
	PanelSchemeColorView;

PanelSchemeColorView = PanelSchemeItemView.extend( {
	getUIType: function() {
		return 'color';
	},

	ui: {
		pickerPlaceholder: '.elementor-panel-scheme-color-picker-placeholder',
	},

	changeUIValue: function( newValue ) {
		this.picker.setColor( newValue );
		this.triggerMethod( 'value:change', this.picker.getColor().toRGBA().toString( 0 ) );

	},

	onBeforeDestroy: function() {
		this.picker.destroyAndRemove();
	},

	onRender: function() {
		this.picker = elementor.helpers.colorPicker( {
			el: this.ui.pickerPlaceholder[ 0 ],
			default: this.model.get( 'value' ),
			onClear: () => {
				this.triggerMethod( 'value:change', '' );
			},
		} );
	},
} );

module.exports = PanelSchemeColorView;
