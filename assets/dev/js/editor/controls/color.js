var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlColorItemView;

ControlColorItemView = ControlBaseDataView.extend( {
	applySavedValue: function() {
		var value = this.getControlValue(),
			colorInstance = this.ui.input.wpColorPicker( 'instance' );

		if ( colorInstance ) {
			this.ui.input.wpColorPicker( 'color', value );

			if ( ! value ) {
				// Trigger `change` event manually, since it will not be triggered automatically on empty value
				this.ui.input.data( 'a8cIris' )._change();
			}
		}
	},

	onReady: function() {
		var self = this;

		elementor.helpers.wpColorPicker( self.ui.input, {
			change: function() {
				self.ui.input.val( self.ui.input.wpColorPicker( 'color' ) ).trigger( 'input' );
			},
			clear: function() {
				self.setValue( '' );
			}
		} );
	},

	onBeforeDestroy: function() {
		if ( this.ui.input.wpColorPicker( 'instance' ) ) {
			this.ui.input.wpColorPicker( 'close' );
		}

		this.$el.remove();
	}
} );

module.exports = ControlColorItemView;
